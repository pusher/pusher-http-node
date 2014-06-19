var util = require('./util');

function WebHook(request, pusher) {
  this.key = request.headers['x-pusher-key'];
  this.signature = request.headers['x-pusher-signature'];
  this.contentType = request.headers['content-type'];
  this.body = request.rawBody;
  this.pusher = pusher;
}

WebHook.prototype.isValid = function(extraTokens) {
  if (extraTokens && !(extraTokens instanceof Array)) {
    // only single token given
    extraTokens = [extraTokens];
  }
  if (this.key === this.pusher.key) {
    return hasCorrectSignature(this.pusher.secret, this.body, this.signature);
  } else if (extraTokens) {
    for (var i in extraTokens) {
      var token = extraTokens[i];
      if (this.key == token.key &&
          hasCorrectSignature(token.secret, this.body, this.signature)) {
        return true;
      }
    }
  }
  return false;
};

WebHook.prototype.getData = function() {
  if (!this.data) {
    switch (this.contentType) {
      case "application/json":
        this.data = JSON.parse(this.body);
        break;
      default:
        throw new Error("Unknown Content-Type (" + this.contentType + ")");
    }
  }
  return this.data;
};

WebHook.prototype.getEvents = function() {
  return this.getData().events;
};

WebHook.prototype.getTime = function() {
  return new Date(this.getData().time_ms);
};

function hasCorrectSignature(secret, body, expectedSignature) {
  return util.getSignature(secret, body) === expectedSignature;
}

module.exports = WebHook;
