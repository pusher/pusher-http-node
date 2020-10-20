const requests = require("./requests")
const NotificationConfig = require("./notification_config")

function NotificationClient(options) {
  this.config = new NotificationConfig(options)
}

NotificationClient.prototype.notify = function (interests, notification) {
  if (!Array.isArray(interests)) {
    throw new Error("Interests must be an array")
  }

  if (interests.length == 0) {
    throw new Error("Interests array must not be empty")
  }

  const body = Object.assign({ interests: interests }, notification)
  return requests.send(this.config, {
    method: "POST",
    body: body,
    path: "/notifications",
  })
}

module.exports = NotificationClient
