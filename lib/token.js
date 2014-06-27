var crypto = require('crypto');

function Token(key, secret) {
  this.key = key;
  this.secret = secret;
}

Token.prototype.sign = function(string) {
  return crypto.createHmac('sha256', this.secret).update(string).digest('hex');
};

Token.prototype.verify = function(string, signature) {
  // TODO prevent timing attacks
  return this.sign(string) === signature;
};

module.exports = Token;
