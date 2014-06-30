var Token = require('./token');

function Config(options) {
  options = options || {}

  this.host = options.host || "api.pusherapp.com";
  this.scheme = options.scheme || "http";
  this.port = options.port;

  this.appId = options.appId;
  this.token = new Token(options.key, options.secret);

  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.keepAlive = options.keepAlive;
}

Config.prototype.getFullPath = function(subPath) {
  return "/apps/" + this.appId + subPath;
};

Config.prototype.getURL = function(subPath, queryString) {
  var path = this.getFullPath(subPath);
  var port = this.port ? (':' + this.port) : '';
  return this.scheme + '://' + this.host + port + path + "?" + queryString;
};

module.exports = Config;
