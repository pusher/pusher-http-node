var url = require('url');

var request = require('request');

var errors = require('./errors');
var util = require('./util');

var Token = require('./token')
var WebHook = require('./webhook');

var RESERVED_QUERY_KEYS = {
  auth_key: true,
  auth_timestamp: true,
  auth_version: true,
  auth_signature: true,
  body_md5: true
};

function Pusher(options) {
  options = options || {}

  this.host = options.host || "api.pusherapp.com";
  this.scheme = options.scheme || "http";
  // TODO don't infer the port, let the http library do that
  this.port = options.port || (this.scheme === "http" ? 80 : 443);

  this.appId = options.appId;
  this.token = new Token(options.key, options.secret);

  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.request = options.keepAlive ? request.forever() : request;
};

Pusher.forURL = function(pusherUrl, options) {
  var apiUrl = url.parse(pusherUrl);
  var apiPath = apiUrl.pathname.split("/");
  var apiAuth = apiUrl.auth.split(":");

  return new Pusher(util.mergeObjects({}, options || {}, {
    scheme: apiUrl.protocol.replace(/:$/, ""),
    host: apiUrl.hostname,
    port: parseInt(apiUrl.port),
    appId: parseInt(apiPath[apiPath.length-1]),
    key: apiAuth[0],
    secret: apiAuth[1]
  }));
}

Pusher.forCluster = function(cluster, options) {
  return new Pusher(util.mergeObjects({}, options || {}, {
    host: "api-" + cluster + ".pusher.com"
  }));
}

Pusher.prototype.authenticate = function(socketId, channel, channelData) {
  var returnHash = {};
  var channelDataStr = '';
  if (channelData) {
    channelData = JSON.stringify(channelData);
    channelDataStr = ':' + channelData;
    returnHash.channel_data = channelData;
  }
  var signature = this.token.sign(socketId + ':' + channel + channelDataStr);
  returnHash.auth = this.token.key + ':' + signature;
  return(returnHash);
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

  var eventData = {
    "name": event,
    "data": (typeof data === 'object' ? JSON.stringify(data) : data),
    "channels": channels
  };

  if (socketId) {
    eventData.socket_id = socketId;
  }

  return this.post({ path: '/events', body: eventData }, callback);
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
  var path = '/apps/' + this.appId + options.path;
  var requestBody = JSON.stringify(options.body);
  var queryString = this.createSignedQueryString({
    method: 'POST',
    path: path,
    body: requestBody
  });

  var port = this.port === 80 ? '' : ':' + this.port;
  var url = this.scheme + '://' + this.host + port + path + "?" + queryString;

  this.request.post({
    url: url,
    proxy: this.proxy,
    timeout: this.timeout,
    headers: {
      'content-type': 'application/json'
    },
    body: requestBody
  }, function(err, res, resBody) {
    dispatchRequestResult(err, url, this.req, res, callback);
  });

  return this;
};

/**
 * Make a get request to Pusher. Authentication is handled for you.
 *
 * @param {{
 *  path: String, // the path for the request
 * }} options
 */
Pusher.prototype.get = function(options, callback) {
  var path = '/apps/' + this.appId + options.path;
  var queryString = this.createSignedQueryString({
    method: 'GET',
    path: path,
    params: options.params
  });

  var port = this.port === 80 ? '' : ':' + this.port;
  var url = this.scheme + '://' + this.host + port + path + "?" + queryString;

  this.request.get({
    url: url,
    proxy: this.proxy,
    timeout: this.timeout
  }, function(err, res) {
    dispatchRequestResult(err, url, this.req, res, callback);
  });

  return this;
};

/**
 * Create a WebHook object for a given request.
 *
 * @param {http.IncomingMessage} request
 */
Pusher.prototype.webhook = function(request) {
  return new WebHook(this.token, request);
}

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
  var timestamp = parseInt(new Date().getTime() / 1000);

  var params = {
    auth_key: this.token.key,
    auth_timestamp: timestamp,
    auth_version: '1.0'
  };

  if (options.body) {
    params.body_md5 = util.getMD5(options.body);
  }

  if (options.params) {
    for (var key in options.params) {
      if (RESERVED_QUERY_KEYS[key] !== undefined) {
        throw Error(key + ' is a required parameter and cannot be overidden');
      }
      params[key] = options.params[key];
    }
  }

  var sortedKeyVal = util.toOrderedArray(params);
  var queryString = sortedKeyVal.join('&');

  var signData = [options.method, options.path, queryString].join('\n');
  queryString += '&auth_signature=' + this.token.sign(signData);

  return queryString;
};

function dispatchRequestResult(err, url, req, res, callback) {
  if (typeof callback !== "function") {
    return;
  }

  var error = null;
  if (err) {
    error = new errors.RequestError(
      "Request failed with an error",
      err,
      url,
      res ? res.statusCode : null,
      res ? res.body : null
    );
  } else if (res.statusCode >= 400) {
    error = new errors.RequestError(
      "Unexpected status code " + res.statusCode,
      err,
      url,
      res ? res.statusCode : null,
      res ? res.body : null
    );
  }
  callback(error, req, res);
}

Pusher.Token = Token;

Pusher.RequestError = errors.RequestError;
Pusher.WebHookError = errors.WebHookError;

module.exports = Pusher;
