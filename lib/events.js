exports.trigger = function(pusher, channels, eventName, data, socketId, callback) {
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

exports.triggerBatch = function(pusher, batch, callback) {
  for (var i = 0; i < batch.length; i++) {
    batch[i].data = ensureJSON(batch[i].data);
  }
  pusher.post({ path: '/batch_events', body: { batch: batch } }, callback);
}

function ensureJSON(data) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
