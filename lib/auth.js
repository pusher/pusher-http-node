const util = require("./util")

function getSocketSignature(pusher, token, channel, socketID, data) {
  const result = {}

  const signatureData = [socketID, channel]
  if (data) {
    const serializedData = JSON.stringify(data)
    signatureData.push(serializedData)
    result.channel_data = serializedData
  }

  result.auth = token.key + ":" + token.sign(signatureData.join(":"))

  if (util.isEncryptedChannel(channel)) {
    if (pusher.config.encryptionMasterKey === undefined) {
      throw new Error(
        "Cannot generate shared_secret because encryptionMasterKey is not set"
      )
    }
    result.shared_secret = Buffer.from(
      pusher.channelSharedSecret(channel)
    ).toString("base64")
  }

  return result
}

exports.getSocketSignature = getSocketSignature
