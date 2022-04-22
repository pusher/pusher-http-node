const crypto = require("crypto")
const url = require("url")

const auth = require("./auth")
const errors = require("./errors")
const events = require("./events")
const requests = require("./requests")

const PusherConfig = require("./pusher_config")
const Token = require("./token")
const WebHook = require("./webhook")
const NotificationClient = require("./notification_client")

const validateChannel = function (channel) {
  if (
    typeof channel !== "string" ||
    channel === "" ||
    channel.match(/[^A-Za-z0-9_\-=@,.;]/)
  ) {
    throw new Error("Invalid channel name: '" + channel + "'")
  }
  if (channel.length > 200) {
    throw new Error("Channel name too long: '" + channel + "'")
  }
}

const validateSocketId = function (socketId) {
  if (
    typeof socketId !== "string" ||
    socketId === "" ||
    !socketId.match(/^\d+\.\d+$/)
  ) {
    throw new Error("Invalid socket id: '" + socketId + "'")
  }
}

const validateUserId = function (userId) {
  if (typeof userId !== "string" || userId === "") {
    throw new Error("Invalid user id: '" + userId + "'")
  }
}

const validateUserData = function (userData) {
  if (userData == null || typeof userData !== "object") {
    throw new Error("Invalid user data: '" + userData + "'")
  }
  validateUserId(userData.id)
}

/** Provides access to Pusher's REST API, WebHooks and authentication.
 *
 * @constructor
 * @param {Object} options
 * @param {String} [options.host="api.pusherapp.com"] API hostname
 * @param {String} [options.notification_host="api.pusherapp.com"] Notification API hostname
 * @param {Boolean} [options.useTLS=false] whether to use TLS
 * @param {Boolean} [options.encrypted=false] deprecated; renamed to `useTLS`
 * @param {Boolean} [options.notification_encrypted=false] whether to use TLS for notifications
 * @param {Integer} [options.port] port, default depends on the scheme
 * @param {Integer} options.appId application ID
 * @param {String} options.key application key
 * @param {String} options.secret application secret
 * @param {Integer} [options.timeout] request timeout in milliseconds
 * @param {Agent} [options.agent] http agent to use
 */
function Pusher(options) {
  this.config = new PusherConfig(options)
  const notificationOptions = Object.assign({}, options, {
    host: options.notificationHost,
    encrypted: options.notificationEncrypted,
  })
  this.notificationClient = new NotificationClient(notificationOptions)
}

/** Create a Pusher instance using a URL.
 *
 * URL should be in SCHEME://APP_KEY:SECRET_KEY@HOST:PORT/apps/APP_ID form.
 *
 * @param {String} pusherUrl URL containing endpoint and app details
 * @param {Object} [options] options, see the {@link Pusher} for details
 * @returns {Pusher} instance configured for the URL and options
 */
Pusher.forURL = function (pusherUrl, options) {
  const apiUrl = url.parse(pusherUrl)
  const apiPath = apiUrl.pathname.split("/")
  const apiAuth = apiUrl.auth.split(":")

  return new Pusher(
    Object.assign({}, options || {}, {
      scheme: apiUrl.protocol.replace(/:$/, ""),
      host: apiUrl.hostname,
      port: parseInt(apiUrl.port, 10) || undefined,
      appId: parseInt(apiPath[apiPath.length - 1], 10),
      key: apiAuth[0],
      secret: apiAuth[1],
    })
  )
}

/** Create a Pusher instance using a cluster name.
 *
 * @param {String} cluster cluster name
 * @param {Object} [options] options, see the {@link Pusher} for details
 * @returns {Pusher} instance configured for the cluster and options
 */
Pusher.forCluster = function (cluster, options) {
  return new Pusher(
    Object.assign({}, options || {}, {
      host: "api-" + cluster + ".pusher.com",
    })
  )
}

/** Returns a signature for given socket id, channel and socket data.
 *
 * @param {String} socketId socket id
 * @param {String} channel channel name
 * @param {Object} [data] additional socket data
 * @returns {String} authorization signature
 */
Pusher.prototype.authorizeChannel = function (socketId, channel, data) {
  validateSocketId(socketId)
  validateChannel(channel)

  return auth.getSocketSignature(
    this,
    this.config.token,
    channel,
    socketId,
    data
  )
}

/** Returns a signature for given socket id, channel and socket data.
 *
 *  DEPRECATED. Use authorizeChannel.
 *
 * @param {String} socketId socket id
 * @param {String} channel channel name
 * @param {Object} [data] additional socket data
 * @returns {String} authorization signature
 */
Pusher.prototype.authenticate = Pusher.prototype.authorizeChannel

/** Returns a signature for given socket id and user data.
 *
 * @param {String} socketId socket id
 * @param {Object} userData user data
 * @returns {String} authentication signature
 */
Pusher.prototype.authenticateUser = function (socketId, userData) {
  validateSocketId(socketId)
  validateUserData(userData)

  return auth.getSocketSignatureForUser(this.config.token, socketId, userData)
}

/** Sends an event to a user.
 *
 * Event name can be at most 200 characters long.
 *
 * @param {String} userId user id
 * @param {String} event event name
 * @param data event data, objects are JSON-encoded
 * @returns {Promise} a promise resolving to a response, or rejecting to a RequestError.
 * @see RequestError
 */
Pusher.prototype.sendToUser = function (userId, event, data) {
  if (event.length > 200) {
    throw new Error("Too long event name: '" + event + "'")
  }
  validateUserId(userId)
  return events.trigger(this, [`#server-to-user-${userId}`], event, data)
}

/** Terminate users's connections.
 *
 *
 * @param {String} userId user id
 * @returns {Promise} a promise resolving to a response, or rejecting to a RequestError.
 * @see RequestError
 */
Pusher.prototype.terminateUserConnections = function (userId) {
  validateUserId(userId)
  return this.post({ path: `/users/${userId}/terminate_connections`, body: {} })
}

/** Triggers an event.
 *
 * Channel names can contain only characters which are alphanumeric, '_' or '-'
 * and have to be at most 200 characters long.
 *
 * Event name can be at most 200 characters long.
 *
 * Returns a promise resolving to a response, or rejecting to a RequestError.
 *
 * @param {String|String[]} channel list of at most 100 channels
 * @param {String} event event name
 * @param data event data, objects are JSON-encoded
 * @param {Object} [params] additional optional request body parameters
 * @param {String} [params.socket_id] id of a socket that should not receive the event
 * @param {String} [params.info] a comma separate list of attributes to be returned in the response. Experimental, see https://pusher.com/docs/lab#experimental-program
 * @see RequestError
 */
Pusher.prototype.trigger = function (channels, event, data, params) {
  if (params && params.socket_id) {
    validateSocketId(params.socket_id)
  }
  if (!(channels instanceof Array)) {
    // add single channel to array for multi trigger compatibility
    channels = [channels]
  }
  if (event.length > 200) {
    throw new Error("Too long event name: '" + event + "'")
  }
  if (channels.length > 100) {
    throw new Error("Can't trigger a message to more than 100 channels")
  }
  for (let i = 0; i < channels.length; i++) {
    validateChannel(channels[i])
  }
  return events.trigger(this, channels, event, data, params)
}

/* Triggers a batch of events
 *
 * @param {Event[]} An array of events, where Event is
 * {
 *   name: string,
 *   channel: string,
 *   data: any JSON-encodable data,
 *   socket_id: [optional] string,
 *   info: [optional] string experimental, see https://pusher.com/docs/lab#experimental-program
 * }
 */
Pusher.prototype.triggerBatch = function (batch) {
  return events.triggerBatch(this, batch)
}

Pusher.prototype.notify = function () {
  this.notificationClient.notify.apply(this.notificationClient, arguments)
}

/** Makes a POST request to Pusher, handles the authentication.
 *
 * Returns a promise resolving to a response, or rejecting to a RequestError.
 *
 * @param {Object} options
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @param {String} options.body request body
 * @see RequestError
 */
Pusher.prototype.post = function (options) {
  return requests.send(
    this.config,
    Object.assign({}, options, { method: "POST" })
  )
}

/** Makes a GET request to Pusher, handles the authentication.
 *
 * Returns a promise resolving to a response, or rejecting to a RequestError.
 *
 * @param {Object} options
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @see RequestError
 */
Pusher.prototype.get = function (options) {
  return requests.send(
    this.config,
    Object.assign({}, options, { method: "GET" })
  )
}

/** Creates a WebHook object for a given request.
 *
 * @param {Object} request
 * @param {Object} request.headers WebHook HTTP headers with lower-case keys
 * @param {String} request.rawBody raw WebHook body
 * @returns {WebHook}
 */
Pusher.prototype.webhook = function (request) {
  return new WebHook(this.config.token, request)
}

/** Builds a signed query string that can be used in a request to Pusher.
 *
 * @param {Object} options
 * @param {String} options.method request method
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @param {String} options.body request body
 * @returns {String} signed query string
 */
Pusher.prototype.createSignedQueryString = function (options) {
  return requests.createSignedQueryString(this.config.token, options)
}

Pusher.prototype.channelSharedSecret = function (channel) {
  return crypto
    .createHash("sha256")
    .update(
      Buffer.concat([Buffer.from(channel), this.config.encryptionMasterKey])
    )
    .digest()
}

/** Exported {@link Token} constructor. */
Pusher.Token = Token
/** Exported {@link RequestError} constructor. */
Pusher.RequestError = errors.RequestError
/** Exported {@link WebHookError} constructor. */
Pusher.WebHookError = errors.WebHookError

module.exports = Pusher
