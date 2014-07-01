function trigger(pusher, channels, eventName, data, socketId, callback) {
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

exports.trigger = trigger;
