var Config = require('./config');
var requests = require('./requests');
var util = require('./util');
var NotificationConfig = require('./notification_config');

function NotificationClient(options){
  this.config = new NotificationConfig(options);
}

NotificationClient.prototype.notify = function(interests, notification, callback) {
  var body = util.mergeObjects({interests: interests}, notification);
  requests.send(this.config, {
    method: "POST",
    body: body,
    path: "/notification"
  }, callback);
}

module.exports = NotificationClient;
