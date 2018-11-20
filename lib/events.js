const nacl = require("tweetnacl");

function encrypt(pusher, channel, data) {
  if (pusher.config.encryptionMasterKey === undefined) {
    throw new Error("Set encryptionMasterKey before triggering events on encrypted channels");
  }

  const nonceBytes = nacl.randomBytes(24);

  const ciphertextBytes = nacl.secretbox(
    Buffer.from(JSON.stringify(data), 'utf8'),
    nonceBytes,
    pusher.channelSharedSecret(channel));

  return JSON.stringify({
    nonce: Buffer(nonceBytes).toString('base64'),
    ciphertext: Buffer(ciphertextBytes).toString('base64')
  });
}

exports.trigger = function(pusher, channels, eventName, data, socketId, callback) {
  if (channels.length === 1 && pusher.isEncryptedChannel(channels[0])) {
    var channel = channels[0];
    var event = {
      "name": eventName,
      "data": encrypt(pusher, channel, data),
      "channel": channel
    };
    if (socketId) {
      event.socket_id = socketId;
    }
    pusher.post({ path: '/events', body: event }, callback);
  } else {
    for (var i = 0; i < channels.length; i++) {
      if (pusher.isEncryptedChannel(channels[i])) {
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
    batch[i].data = pusher.isEncryptedChannel(batch[i].channel) ?
      encrypt(pusher, batch[i].channel, batch[i].data) :
      ensureJSON(batch[i].data);
  }
  pusher.post({ path: '/batch_events', body: { batch: batch } }, callback);
}

function ensureJSON(data) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
