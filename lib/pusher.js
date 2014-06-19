var url = require('url');

var request = require('request');

var util = require('./util');
var WebHook = require('./webhook');

function Pusher(options) {
  options = options || {}
  if (options.url) {
    var apiUrl = url.parse(options.url);
    var apiPath = apiUrl.pathname.split("/");
    var apiAuth = apiUrl.auth.split(":");
    this.scheme = apiUrl.protocol.replace(/:$/, "");
    this.host = apiUrl.hostname;
    this.port = parseInt(apiUrl.port) || (this.scheme === "http" ? 80 : 443);
    this.appId = parseInt(apiPath[apiPath.length-1]);
    this.key = apiAuth[0];
    this.secret = apiAuth[1];
  } else {
    if (options.cluster) {
      this.host = "api-" + options.cluster + ".pusher.com";
    } else {
      this.host = options.host || "api.pusherapp.com";
    }
    this.scheme = options.scheme || "http";
    this.port = options.port || (this.scheme === "http" ? 80 : 443);

    this.appId = options.appId;
    this.key = options.key;
    this.secret = options.secret;
  }
  this.proxy = options.proxy;
  this.timeout = options.timeout;
  this.request = options.keepAlive ? request.forever() : request;
};

Pusher.prototype.authenticate = function(socketId, channel, channelData) {
  var returnHash = {};
  var channelDataStr = '';
  if (channelData) {
    channelData = JSON.stringify(channelData);
    channelDataStr = ':' + channelData;
    returnHash.channel_data = channelData;
  }
  var stringToSign = socketId + ':' + channel + channelDataStr;
  var signature = util.getSignature(this.secret, stringToSign);
  returnHash.auth = this.key + ':' + signature;
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
  if ((channels instanceof Array) === false) {
    // add single channel to array for multi trigger compatibility
    channels = [channels];
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
    // although using request module the callback signature
    // needs to be maintained
    if (typeof callback === 'function') {
      callback(err, this.req, res);
    }
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
  }, function(err, res, resBody) {
    if (typeof callback === 'function') {
      callback(err, this.req, res);
    }
  });

  return this;
};

/**
 * Create a WebHook object for a given request.
 *
 * @param {http.IncomingMessage} request
 */
Pusher.prototype.webhook = function(request) {
  return new WebHook(request, this);
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
    auth_key: this.key,
    auth_timestamp: timestamp,
    auth_version: '1.0'
  };

  if (options.body) {
    params.body_md5 = util.getMD5(options.body);
  }

  if (options.params) {
    for (var name in options.params) {
      if (params[name] !== undefined) {
        throw Error(name + ' is a required parameter and cannot be overidden');
      }
      params[name] = options.params[name];
    }
  }

  var sortedKeyVal = util.toOrderedArray(params);
  var queryString = sortedKeyVal.join('&');

  var signData = [options.method, options.path, queryString].join('\n');
  var signature = util.getSignature(this.secret, signData);

  // TODO you can pass auth_signature in options and it will be appended too
  queryString += '&auth_signature=' + signature;

  return queryString;
};

module.exports = Pusher;
