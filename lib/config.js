var Token = require('./token');

function Config(options) {
  options = options || {};

  if (options.host) {
    this.host = options.host
  }
  else if (options.cluster) {
    this.host = "api-"+options.cluster+".pusher.com";
  }
  else {
    this.host = "api.pusherapp.com";
  }

  this.scheme = options.scheme || (options.encrypted ? "https" : "http");
  this.port = options.port;

  this.appId = options.appId;
  this.token = new Token(options.key, options.secret);

  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.keepAlive = options.keepAlive;
}

Config.prototype.prefixPath = function(subPath) {
  return "/apps/" + this.appId + subPath;
};

Config.prototype.getBaseURL = function(subPath, queryString) {
  var port = this.port ? (':' + this.port) : '';
  return this.scheme + '://' + this.host + port;
};

module.exports = Config;
