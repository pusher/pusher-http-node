var crypto = require('crypto');

function toOrderedArray(map) {
  return Object.keys(map).map(function(key) {
    return [key, map[key]];
  }).sort(function(a, b) {
    return a[0] > b[0];
  }).map(function(pair) {
    return pair[0] + "=" + pair[1];
  });
}

function getSignature(secret, string) {
  return crypto.createHmac('sha256', secret).update(string).digest('hex');
}

function getMD5(body) {
  return crypto.createHash('md5').update(body, 'utf8').digest('hex');
}

exports.toOrderedArray = toOrderedArray;
exports.getSignature = getSignature;
exports.getMD5 = getMD5;
