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
  const encryptedBatch = [];
  const plaintextChannels = [];

  for (var i = 0; i < channels.length; i++) {
    if (pusher.isEncryptedChannel(channels[i])) {
      encryptedBatch.push({ channel: channels[i], name: eventName, data: data, socket_id: socketId });
    } else {
      plaintextChannels.push(channels[i]);
    }
  }

  if (encryptedBatch.length > 0 && plaintextChannels.length > 0) {
    throw new Error("Don't mix encrypted channels with non-encrypted channels in the same call to trigger(). Use triggerBatch() instead");
  } else if (encryptedBatch.length > 0) {
    exports.triggerBatch(pusher, encryptedBatch, callback);
  } else {
    var event = {
      "name": eventName,
      "data": ensureJSON(data),
      "channels": plaintextChannels
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
