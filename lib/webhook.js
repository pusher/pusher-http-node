function WebHook(request, pusher) {
  this.key = request.headers['x-pusher-key'];
  this.signature = request.headers['x-pusher-signature'];
  this.contentType = request.headers['content-type'];
  this.body = request.rawBody;
  this.pusher = pusher;
}

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

module.exports = WebHook;
