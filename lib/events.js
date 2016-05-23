exports.trigger = function(pusher, channels, eventName, data, socketId, callback) {
  var event = {
    "name": eventName,
    "data": (typeof data === 'object' ? JSON.stringify(data) : data),
    "channels": channels
  };
  if (socketId) {
    event.socket_id = socketId;
  }
  pusher.post({ path: '/events', body: event }, callback);
}

exports.triggerBatch = function(pusher, batch, callback) {
	pusher.post({ path: '/batch_events', body: { batch: batch } }, callback);
}
