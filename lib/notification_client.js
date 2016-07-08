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
  this.validateNotification(body);
  requests.send(this.config, {
    method: "POST",
    body: body,
    path: "/notifications"
  }, callback);
}

NotificationClient.prototype.validateNotification = function(notification) {
	var gcmPayload = notification.gcm;
	if (!gcmPayload && !notification.apns) {
		throw new Error("Notification must have fields APNS or GCM");
	}

	if (gcmPayload) {
		for (var index in RESTRICTED_GCM_KEYS) {
			var restrictedKey = RESTRICTED_GCM_KEYS[index];
			delete(gcmPayload[restrictedKey]);
		}

		var ttl = gcmPayload.time_to_live;
		if (ttl) {
			if (isNaN(ttl)) {
				throw new Error("provided ttl must be a number");
			}

			if (!(ttl > 0 && ttl < GCM_TTL)) {
				throw new Error("GCM time_to_live must be between 0 and 241920 (4 weeks)");
			}
		}

		var gcmPayloadNotification = gcmPayload.notification;
		if (gcmPayloadNotification) {
			var title = gcmPayloadNotification.title;
			var icon = gcmPayloadNotification.icon;
			var requiredFields = [title, icon];

			if (typeof(title) !== 'string' || title.length === 0) {
					throw new Error("GCM title must be a string and not empty");
			}

			if (typeof(icon) !== 'string' || icon.length === 0) {
					throw new Error("GCM icon must be a string and not empty");
			}
		}
	}

	var webhookURL = notification.webhook_url;
	var webhookLevel = notification.webhook_level;

	if (webhookLevel) {
		if (!webhookURL) throw new Error("webhook_level cannot be used without a webhook_url");
		if (!WEBHOOK_LEVELS[webhookLevel]) {
			throw new Error("webhook_level must be either INFO or DEBUG. Blank will default to INFO");
		}
	}
}

module.exports = NotificationClient;
