var Config = require('./config');
var requests = require('./requests');
var util = require('./util');
var NotificationConfig = require('./notification_config');

var RESTRICTED_GCM_KEYS = ['to', 'registration_ids'];
var GCM_TTL = 241920;
var WEBHOOK_LEVELS = {
	"INFO": true,
	"DEBUG": true,
	"": true
}

function NotificationClient(options){
  this.config = new NotificationConfig(options);
}

NotificationClient.prototype.notify = function(interests, notification, callback) {
	if (!Array.isArray(interests)) {
		throw new Error("Interests must be an array");
	}

	if (interests.length != 1) {
		throw new Error("Currently sending to more than one interest is unsupported")
	}


  var body = util.mergeObjects({interests: interests}, notification);
  requests.send(this.config, {
    method: "POST",
    body: body,
    path: "/notifications"
  }, callback);
}

module.exports = NotificationClient;
