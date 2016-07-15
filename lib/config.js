var Token = require('./token');

function Config(options) {
  options = options || {};

  this.scheme = options.scheme || (options.encrypted ? "https" : "http");
  this.port = options.port;

  this.appId = options.appId;
  this.token = new Token(options.key, options.secret);

  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.keepAlive = options.keepAlive;
}

Config.prototype.prefixPath = function(subPath) {
  throw("NotImplementedError: #prefixPath should be implemented by subclasses");
};

Config.prototype.getBaseURL = function(subPath, queryString) {
  var port = this.port ? (':' + this.port) : '';
  return this.scheme + '://' + this.host + port;
};

module.exports = Config;
