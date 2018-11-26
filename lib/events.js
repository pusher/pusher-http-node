var util = require('./util');
var nacl = require('tweetnacl');
var naclUtil = require('tweetnacl-util');

function encrypt(pusher, channel, data) {
  if (pusher.config.encryptionMasterKey === undefined) {
    throw new Error("Set encryptionMasterKey before triggering events on encrypted channels");
  }

  var nonceBytes = nacl.randomBytes(24);

  var ciphertextBytes = nacl.secretbox(
    naclUtil.decodeUTF8(JSON.stringify(data)),
    nonceBytes,
    pusher.channelSharedSecret(channel));

  return JSON.stringify({
    nonce: naclUtil.encodeBase64(nonceBytes),
    ciphertext: naclUtil.encodeBase64(ciphertextBytes)
  });
}

exports.trigger = function(pusher, channels, eventName, data, socketId, callback) {
  if (channels.length === 1 && util.isEncryptedChannel(channels[0])) {
    var channel = channels[0];
    var event = {
      "name": eventName,
      "data": encrypt(pusher, channel, data),
      "channels": [channel]
    };
    if (socketId) {
      event.socket_id = socketId;
    }
    pusher.post({ path: '/events', body: event }, callback);
  } else {
    for (var i = 0; i < channels.length; i++) {
      if (util.isEncryptedChannel(channels[i])) {
        // For rationale, see limitations of end-to-end encryption in the README
        throw new Error("You cannot trigger to multiple channels when using encrypted channels");
      }
    }

    var event = {
      "name": eventName,
      "data": ensureJSON(data),
      "channels": channels
    };
    if (socketId) {
      event.socket_id = socketId;
    }
    pusher.post({ path: '/events', body: event }, callback);
  }
}

exports.triggerBatch = function(pusher, batch, callback) {
  for (var i = 0; i < batch.length; i++) {
    batch[i].data = util.isEncryptedChannel(batch[i].channel) ?
      encrypt(pusher, batch[i].channel, batch[i].data) :
      ensureJSON(batch[i].data);
  }
  pusher.post({ path: '/batch_events', body: { batch: batch } }, callback);
}

function ensureJSON(data) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
