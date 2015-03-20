function trigger(pusher, channels, eventName, data, socketId, callback) {
  var event = {
    "name": eventName,
    "data": (typeof data === 'object' ? JSON.stringify(data) : data),
    "channels": channels
  };
  if (socketId) {
    event.socket_id = socketId;
  }
  pusher.post({ path: '/events', body: event }, function(error, req, res) {
    if (!callback) {
      return;
    }
    if (error) {
      callback(error, undefined, req, res);
    } else {
      callback(error, JSON.parse(res.body), req, res);
    }
  });
}

exports.trigger = trigger;
