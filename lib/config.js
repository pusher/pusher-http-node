var Token = require('./token');

function Config(options) {
  options = options || {};

  var useTLS = false;
  if (options.useTLS !== undefined && options.encrypted !== undefined) {
    throw new Error("Cannot set both `useTLS` and `encrypted` configuration options");
  } else if (options.useTLS !== undefined) {
    useTLS = options.useTLS;
  } else if (options.encrypted !== undefined) {
    // `encrypted` deprecated in favor of `useTLS`
    console.warn("`encrypted` option is deprecated in favor of `useTLS`");
    useTLS = options.encrypted;
  }
  this.scheme = options.scheme || (useTLS ? "https" : "http");
  this.port = options.port;

  this.appId = options.appId;
  this.token = new Token(options.key, options.secret);

  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.keepAlive = options.keepAlive;

  if (options.encryptionMasterKey !== undefined) {
    if (typeof(options.encryptionMasterKey) !== 'string') {
      throw new Error("encryptionMasterKey must be a string");
    }
    if (options.encryptionMasterKey.length !== 32) {
      throw new Error("encryptionMasterKey must be 32 characters long, but the string '" + options.encryptionMasterKey + "' is " + options.encryptionMasterKey.length + " characters long");
    }
    this.encryptionMasterKey = options.encryptionMasterKey;
  }
}

Config.prototype.prefixPath = function(subPath) {
  throw("NotImplementedError: #prefixPath should be implemented by subclasses");
};

Config.prototype.getBaseURL = function(subPath, queryString) {
  var port = this.port ? (':' + this.port) : '';
  return this.scheme + '://' + this.host + port;
};

module.exports = Config;
