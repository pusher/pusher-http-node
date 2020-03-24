var Config = require('./config');
var util = require('./util');

function PusherConfig(options) {
  Config.call(this, options);

  if (options.host) {
    this.host = options.host
  }
  else if (options.cluster) {
    this.host = "api-"+options.cluster+".pusher.com";
  }
  else {
    this.host = "api.pusherapp.com";
  }
}

util.mergeObjects(PusherConfig.prototype, Config.prototype);

PusherConfig.prototype.prefixPath = function(subPath) {
  return "/apps/" + this.appId + subPath;
};

module.exports = PusherConfig;
