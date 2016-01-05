var crypto = require('crypto');
var Buffer = Buffer || require('buffer').Buffer;
var util = require('./util');

/** Verifies and signs data against the key and secret.
 *
 * @constructor
 * @param {String} key app key
 * @param {String} secret app secret
 */
function Token(key, secret) {
  this.key = key;
  this.secret = secret;
}

/** Signs the string using the secret.
 *
 * @param {String} string
 * @returns {String}
 */
Token.prototype.sign = function(string) {
  return crypto.createHmac('sha256', this.secret)
    .update(new Buffer(string, 'utf-8'))
    .digest('hex');
};

/** Checks if the string has correct signature.
 *
 * @param {String} string
 * @param {String} signature
 * @returns {Boolean}
 */
Token.prototype.verify = function(string, signature) {
  return util.secureCompare(this.sign(string), signature);
};

module.exports = Token;
