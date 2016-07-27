var Config = require('./config');
var util = require('./util');

var DEFAULT_HOST = "nativepush-cluster1.pusher.com";
var API_PREFIX = "server_api";
var API_VERSION = "v1";

function NotificationConfig(options) {
	Config.call(this, options);
	this.host = options.host || DEFAULT_HOST;
}

util.mergeObjects(NotificationConfig.prototype, Config.prototype);

NotificationConfig.prototype.prefixPath = function(subPath) {
  return "/" + API_PREFIX + "/" + API_VERSION + "/apps/" + this.appId + subPath;
};

module.exports = NotificationConfig;
