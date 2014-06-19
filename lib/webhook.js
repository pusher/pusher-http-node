var crypto = require('crypto');

function WebHook(request, pusher) {
  this.key = request.headers['x-pusher-key'];
  this.signature = request.headers['x-pusher-signature'];
  this.contentType = request.headers['content-type'];
  this.body = request.rawBody;
  this.pusher = pusher;
}

WebHook.prototype.isValid = function() {
  if (this.key === this.pusher.key) {
    return hasCorrectSignature(this.signature, this.pusher.secret, this.body);
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

function hasCorrectSignature(expectedSignature, secret, body) {
  var signature = crypto.createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return signature === expectedSignature;
}

module.exports = WebHook;
