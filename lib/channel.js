/**
 * Channel object used for legacy support. Should not be extended.
 */
function Channel(channelName, pusher) {
  this._channelName = channelName;
  this._pusher = pusher;
}

/**
 * Trigger an event on a channel.
 */
Channel.prototype.trigger = function(event, message, callback) {
  var socketId = null;
  this._pusher.trigger(this._channelName, event, message, socketId, callback);
};

module.exports = Channel;
