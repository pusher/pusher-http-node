var url = require('url');

var auth = require('./auth');
var errors = require('./errors');
var events = require('./events');
var requests = require('./requests');
var util = require('./util');

var Config = require('./config');
var Token = require('./token');
var WebHook = require('./webhook');

/** Callback passed to all REST API methods.
 *
 * @callback requestCallback
 * @param {RequestError} error
 * @param request
 * @param response
 */

/** Provides access to Pusher's REST API, WebHooks and authentication.
 *
 * @constructor
 * @param {Object} options
 * @param {String} [options.host="api.pusherapp.com"] API hostname
 * @param {Boolean} [options.encrypted=false] whether to use SSL
 * @param {Integer} [options.port] port, default depends on the scheme
 * @param {Integer} options.appId application ID
 * @param {String} options.key application key
 * @param {String} options.secret application secret
 * @param {String} [options.proxy] HTTP proxy to channel requests through
 * @param {Integer} [options.timeout] request timeout in milliseconds
 * @param {Boolean} [options.keepAlive] whether requests should use keep-alive
 */
function Pusher(options) {
  this.config = new Config(options);
}

/** Create a Pusher instance using a URL.
 *
 * URL should be in SCHEME://APP_KEY:SECRET_KEY@HOST:PORT/apps/APP_ID form.
 *
 * @param {String} pusherUrl URL containing endpoint and app details
 * @param {Object} [options] options, see the {@link Pusher} for details
 * @returns {Pusher} instance configured for the URL and options
 */
Pusher.forURL = function(pusherUrl, options) {
  var apiUrl = url.parse(pusherUrl);
  var apiPath = apiUrl.pathname.split("/");
  var apiAuth = apiUrl.auth.split(":");

  return new Pusher(util.mergeObjects({}, options || {}, {
    scheme: apiUrl.protocol.replace(/:$/, ""),
    host: apiUrl.hostname,
    port: parseInt(apiUrl.port, 10) || undefined,
    appId: parseInt(apiPath[apiPath.length-1], 10),
    key: apiAuth[0],
    secret: apiAuth[1]
  }));
};

/** Create a Pusher instance using a cluster name.
 *
 * @param {String} cluster cluster name
 * @param {Object} [options] options, see the {@link Pusher} for details
 * @returns {Pusher} instance configured for the cluster and options
 */
Pusher.forCluster = function(cluster, options) {
  return new Pusher(util.mergeObjects({}, options || {}, {
    host: "api-" + cluster + ".pusher.com"
  }));
};

/** Returns a signature for given socket id, channel and socket data.
 *
 * @param {String} socketId socket id
 * @param {String} channel channel name
 * @param {Object} [data] additional socket data
 * @returns {String} authentication signature
 */
Pusher.prototype.authenticate = function(socketId, channel, data) {
  return auth.getSocketSignature(this.config.token, channel, socketId, data);
};

/** Triggers an event.
 *
 * Channel names can contain only characters which are alphanumeric, '_' or '-'
 * and have to be at most 200 characters long.
 *
 * Event name can be at most 200 characters long.
 *
 * Calls back with three arguments - error, request and response. When request
 * completes with code < 400, error will be null. Otherwise, error will be
 * populated with response details.
 *
 * @param {String|String[]} channel list of at most 10 channels
 * @param {String} event event name
 * @param data event data, objects are JSON-encoded
 * @param {String} [socketId] id of a socket that should not receive the event
 * @param {requestCallback} [callback]
 * @see RequestError
 */
Pusher.prototype.trigger = function(channels, event, data, socketId, callback) {
  if (!(channels instanceof Array)) {
    // add single channel to array for multi trigger compatibility
    channels = [channels];
  }
  if (event.length > 200) {
    throw new Error("Too long event name: '" + event + "'");
  }
  if (channels.length > 10) {
    throw new Error("Can't trigger a message to more than 10 channels");
  }
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].length > 200) {
      throw new Error("Too long channel name: '" + channels[i] + "'");
    }
    if (!channels[i].match(/^[a-zA-Z0-9_\-]+$/)) {
      throw new Error("Invalid channel name: '" + channels[i] + "'");
    }
  }
  events.trigger(this, channels, event, data, socketId, callback);
};

/** Makes a POST request to Pusher, handles the authentication.
 *
 * Calls back with three arguments - error, request and response. When request
 * completes with code < 400, error will be null. Otherwise, error will be
 * populated with response details.
 *
 * @param {Object} options
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @param {String} options.body request body
 * @param {requestCallback} [callback]
 * @see RequestError
 */
Pusher.prototype.post = function(options, callback) {
  requests.send(
    this.config, util.mergeObjects({}, options, { method: "POST" }), callback
  );
};

/** Makes a GET request to Pusher, handles the authentication.
 *
 * Calls back with three arguments - error, request and response. When request
 * completes with code < 400, error will be null. Otherwise, error will be
 * populated with response details.
 *
 * @param {Object} options
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @param {requestCallback} [callback]
 * @see RequestError
 */
Pusher.prototype.get = function(options, callback) {
  requests.send(
    this.config, util.mergeObjects({}, options, { method: "GET" }), callback
  );
};

/** Creates a WebHook object for a given request.
 *
 * @param {Object} request
 * @param {Object} request.headers WebHook HTTP headers with lower-case keys
 * @param {String} request.rawBody raw WebHook body
 * @returns {WebHook}
 */
Pusher.prototype.webhook = function(request) {
  return new WebHook(this.config.token, request);
};

/** Builds a signed query string that can be used in a request to Pusher.
 *
 * @param {Object} options
 * @param {String} options.method request method
 * @param {String} options.path request path
 * @param {Object} options.params query params
 * @param {String} options.body request body
 * @returns {String} signed query string
 */
Pusher.prototype.createSignedQueryString = function(options) {
  return requests.createSignedQueryString(this.config.token, options);
};

/** Exported {@link Token} constructor. */
Pusher.Token = Token;
/** Exported {@link RequestError} constructor. */
Pusher.RequestError = errors.RequestError;
/** Exported {@link WebHookError} constructor. */
Pusher.WebHookError = errors.WebHookError;

module.exports = Pusher;
