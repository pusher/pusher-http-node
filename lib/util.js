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

function mergeObjects(target) {
  for (var i = 1; i < arguments.length; i++) {
    var object = arguments[i];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        target[key] = object[key];
      }
    }
  }

  return target;
}

function getMD5(body) {
  return crypto.createHash('md5').update(body, 'utf8').digest('hex');
}

function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  var result = 0;
  for (var i in a) {
    result |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return result === 0;
}

function isEncryptedChannel(channel) {
  return channel.startsWith("private-encrypted-");
}

exports.toOrderedArray = toOrderedArray;
exports.mergeObjects = mergeObjects;
exports.getMD5 = getMD5;
exports.secureCompare = secureCompare;
exports.isEncryptedChannel = isEncryptedChannel;