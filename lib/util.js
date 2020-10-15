const crypto = require("crypto")

function toOrderedArray(map) {
  return Object.keys(map)
    .map(function (key) {
      return [key, map[key]]
    })
    .sort(function (a, b) {
      if (a[0] < b[0]) {
        return -1
      }
      if (a[0] > b[0]) {
        return 1
      }
      return 0
    })
    .map(function (pair) {
      return pair[0] + "=" + pair[1]
    })
}

function getMD5(body) {
  return crypto.createHash("md5").update(body, "utf8").digest("hex")
}

function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (const i in a) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

function isEncryptedChannel(channel) {
  return channel.startsWith("private-encrypted-")
}

exports.toOrderedArray = toOrderedArray
exports.getMD5 = getMD5
exports.secureCompare = secureCompare
exports.isEncryptedChannel = isEncryptedChannel
