var url = require('url');

var auth = require('./auth');
var errors = require('./errors');
var events = require('./events');
var requests = require('./requests');
var util = require('./util');

var Config = require('./config');
var Token = require('./token');
var WebHook = require('./webhook');

function Pusher(options) {
  this.config = new Config(options);
}

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

Pusher.forCluster = function(cluster, options) {
  return new Pusher(util.mergeObjects({}, options || {}, {
    host: "api-" + cluster + ".pusher.com"
  }));
};

Pusher.prototype.authenticate = function(socketId, channel, data) {
  return auth.getSocketSignature(this.config.token, channel, socketId, data);
};

/**
 * Trigger an event
 *
 * The callback receives (error, request, response). A successful request
 * will receive (!error && response.statusCode == 200), both should be checked.
 *
 * On transport errors, the error object will be populated.
 * Application errors are delivered through the response status code,
 *   e.g. 413 if the event data is > 10kb
 */
Pusher.prototype.trigger = function(channels, event, data, socketId, callback) {
  if (!(channels instanceof Array)) {
    // add single channel to array for multi trigger compatibility
    channels = [channels];
  }
  if (channels.length > 10) {
    throw new Error("Can't trigger a message to more than 10 channels");
  }

  return events.trigger(this, channels, event, data, socketId, callback);
};

/**
 * Make a post request to Pusher. Authentication is handled for you.
 *
 * The callback receives (error, request, response). A successful request
 * will receive (!error && response.statusCode == 200), both should be checked.
 *
 * @param {{
 *  path: String, // the path for the request
 *  body: String  // the body of the request
 * }} options
 * @param {Function} callback called when the post has completed
 */
Pusher.prototype.post = function(options, callback) {
  return requests.send(
    this.config, util.mergeObjects({}, options, { method: "POST" }), callback
  );
};

/**
 * Make a get request to Pusher. Authentication is handled for you.
 *
 * @param {{
 *  path: String, // the path for the request
 * }} options
 */
Pusher.prototype.get = function(options, callback) {
  return requests.send(
    this.config, util.mergeObjects({}, options, { method: "GET" }), callback
  );
};

/**
 * Create a WebHook object for a given request.
 *
 * @param {http.IncomingMessage} request
 */
Pusher.prototype.webhook = function(request) {
  return new WebHook(this.config.token, request);
};

/**
 * Create a signed query string that can be used in a request to Pusher.
 *
 * @param {{
 *  method: String, // GET or POST
 *  body: String,   // body, required if making a POST
 *  params: Object  // key value pairs for parameters
 * }} options
 */
Pusher.prototype.createSignedQueryString = function(options) {
  return requests.createSignedQueryString(this.config.token, options);
};

Pusher.Token = Token;

Pusher.RequestError = errors.RequestError;
Pusher.WebHookError = errors.WebHookError;

module.exports = Pusher;
