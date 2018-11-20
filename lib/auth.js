var util = require('./util');

function getSocketSignature(pusher, token, channel, socketID, data) {
  var result = {};

  var signatureData = [socketID, channel];
  if (data) {
    var serializedData = JSON.stringify(data);
    signatureData.push(serializedData);
    result.channel_data = serializedData;
  }

  result.auth = token.key + ':' + token.sign(signatureData.join(":"));

  if (util.isEncryptedChannel(channel) && pusher.config.encryptionMasterKey !== undefined) {
    result.shared_secret = Buffer(pusher.channelSharedSecret(channel)).toString('base64');
  }

  return result;
}

exports.getSocketSignature = getSocketSignature;
