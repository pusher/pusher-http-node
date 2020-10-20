const Config = require("./config")

const DEFAULT_HOST = "nativepush-cluster1.pusher.com"
const API_PREFIX = "server_api"
const API_VERSION = "v1"

function NotificationConfig(options) {
  Config.call(this, options)
  this.host = options.host || DEFAULT_HOST
}

Object.assign(NotificationConfig.prototype, Config.prototype)

NotificationConfig.prototype.prefixPath = function (subPath) {
  return "/" + API_PREFIX + "/" + API_VERSION + "/apps/" + this.appId + subPath
}

module.exports = NotificationConfig
