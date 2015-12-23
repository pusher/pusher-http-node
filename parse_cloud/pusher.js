module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var url = __webpack_require__(1);

	var auth = __webpack_require__(2);
	var errors = __webpack_require__(3);
	var events = __webpack_require__(4);
	var requests = __webpack_require__(5);
	var util = __webpack_require__(7);

	var Config = __webpack_require__(9);
	var Token = __webpack_require__(10);
	var WebHook = __webpack_require__(12);

	var validateChannel = function(channel) {
	  if (typeof channel !== "string" || channel === "" || channel.match(/[^A-Za-z0-9_\-=@,.;]/)) {
	    throw new Error("Invalid channel name: '" + channel + "'");
	  }
	  if (channel.length > 200) {
	    throw new Error("Channel name too long: '" + channel + "'");
	  }
	};

	var validateSocketId = function(socketId) {
	  if (typeof socketId !== "string" || socketId === "" || !socketId.match(/^\d+\.\d+$/)) {
	    throw new Error("Invalid socket id: '" + socketId + "'");
	  }
	};

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
	  validateSocketId(socketId);
	  validateChannel(channel);

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
	  if (socketId) {
	    validateSocketId(socketId);
	  }
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
	    validateChannel(channels[i]);
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 2 */
/***/ function(module, exports) {

	function getSocketSignature(token, channel, socketID, data) {
	  var result = {};

	  var signatureData = [socketID, channel];
	  if (data) {
	    var serializedData = JSON.stringify(data);
	    signatureData.push(serializedData);
	    result.channel_data = serializedData;
	  }

	  result.auth = token.key + ':' + token.sign(signatureData.join(":"));
	  return result;
	}

	exports.getSocketSignature = getSocketSignature;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/** Contains information about an HTTP request error.
	 *
	 * @constructor
	 * @extends Error
	 * @param {String} message error message
	 * @param {String} url request URL
	 * @param [error] optional error cause
	 * @param {Integer} [statusCode] response status code, if received
	 * @param {String} [statusCode] response body, if received
	 */
	function RequestError(message, url, error, statusCode, body) {
	    this.name = 'PusherRequestError';
	    this.stack = (new Error()).stack;

	    /** @member {String} error message */
	    this.message = message;
	    /** @member {String} request URL */
	    this.url = url;
	    /** @member optional error cause */
	    this.error = error;
	    /** @member {Integer} response status code, if received */
	    this.statusCode = statusCode;
	    /** @member {String} response body, if received */
	    this.body = body;
	}
	RequestError.prototype = new Error();

	/** Contains information about a WebHook error.
	 *
	 * @constructor
	 * @extends Error
	 * @param {String} message error message
	 * @param {String} contentType WebHook content type
	 * @param {String} body WebHook body
	 * @param {String} signature WebHook signature
	 */
	function WebHookError(message, contentType, body, signature) {
	    this.name = 'PusherWebHookError';
	    this.stack = (new Error()).stack;

	    /** @member {String} error message */
	    this.message = message;
	    /** @member {String} WebHook content type */
	    this.contentType = contentType;
	    /** @member {String} WebHook body */
	    this.body = body;
	    /** @member {String} WebHook signature */
	    this.signature = signature;
	}
	WebHookError.prototype = new Error();

	exports.RequestError = RequestError;
	exports.WebHookError = WebHookError;


/***/ },
/* 4 */
/***/ function(module, exports) {

	function trigger(pusher, channels, eventName, data, socketId, callback) {
	  var event = {
	    "name": eventName,
	    "data": (typeof data === 'object' ? JSON.stringify(data) : data),
	    "channels": channels
	  };
	  if (socketId) {
	    event.socket_id = socketId;
	  }
	  pusher.post({ path: '/events', body: event }, callback);
	}

	exports.trigger = trigger;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var request = __webpack_require__(6);

	var errors = __webpack_require__(3);
	var util = __webpack_require__(7);

	var RESERVED_QUERY_KEYS = {
	  auth_key: true,
	  auth_timestamp: true,
	  auth_version: true,
	  auth_signature: true,
	  body_md5: true
	};

	function send(config, options, callback) {
	  var handler = config.keepAlive ? request.forever() : request;

	  var path = config.prefixPath(options.path);
	  var body = options.body ? JSON.stringify(options.body) : undefined;

	  var queryString = createSignedQueryString(config.token, {
	    method: options.method,
	    path: path,
	    params: options.params,
	    body: body
	  });

	  var url = config.getBaseURL() + path + "?" + queryString;

	  var params = {
	  	url: url,
	  	proxy: config.proxy,
	  	timeout: config.timeout
	  };

	  if(body) {
	  	params.headers = {'content-type': 'application/json'};
	  	params.body = body;
	  }

	  handler[options.method.toLowerCase()](params, function(err, res, resBody) {
	    dispatchRequestResult(err, url, this.req, res, callback);
	  });
	}

	function createSignedQueryString(token, request) {
	  var timestamp = Date.now() / 1000 | 0;

	  var params = {
	    auth_key: token.key,
	    auth_timestamp: timestamp,
	    auth_version: '1.0'
	  };

	  if (request.body) {
	    params.body_md5 = util.getMD5(request.body);
	  }

	  if (request.params) {
	    for (var key in request.params) {
	      if (RESERVED_QUERY_KEYS[key] !== undefined) {
	        throw Error(key + ' is a required parameter and cannot be overidden');
	      }
	      params[key] = request.params[key];
	    }
	  }

	  var method = request.method.toUpperCase();
	  var sortedKeyVal = util.toOrderedArray(params);
	  var queryString = sortedKeyVal.join('&');

	  var signData = [method, request.path, queryString].join('\n');
	  queryString += '&auth_signature=' + token.sign(signData);

	  return queryString;
	}

	function dispatchRequestResult(err, url, req, res, callback) {
	  if (typeof callback !== "function") {
	    return;
	  }

	  var error = null;
	  if (err) {
	    error = new errors.RequestError(
	      "Request failed with an error",
	      url,
	      err,
	      res ? res.statusCode : null,
	      res ? res.body : null
	    );
	  } else if (res.statusCode >= 400) {
	    error = new errors.RequestError(
	      "Unexpected status code " + res.statusCode,
	      url,
	      err,
	      res ? res.statusCode : null,
	      res ? res.body : null
	    );
	  }
	  callback(error, req, res);
	}

	exports.send = send;
	exports.createSignedQueryString = createSignedQueryString;


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = ParseRequest = {

	  get: function(params, callback) {
	    this._request('GET', params, callback);
	  },

	  post: function(params, callback) {
	    this._request('POST', params, callback);
	  },

	  _request: function(method, params, callback){
	    var request = {
	      method: method,
	      url: params.url,
	      headers: params.headers,
	      body: params.body
	    };

	    var success = function(res){
	      var err = null;
	      var res = new ParseResponse(res);
	      var body = res.body;
	      callback(err, res, body);
	    }

	    var error = function(res){
	      var res = new ParseResponse(res);
	      var err = body = res.body;
	      callback(err, res, body);
	    }

	    Parse.Cloud.httpRequest(request).then(success, error);
	  },

	  forever: function(){
	    console.log("This Parse extension does not support keep-alive. " +
	      " Falling back to default...");
	    return this;
	  }
	}

	function ParseResponse(raw){
	  this.statusCode = raw.status;
	  this.body = raw.text;
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var crypto = __webpack_require__(8);

	function toOrderedArray(map) {
	  return Object.keys(map).map(function(key) {
	    return [key, map[key]];
	  }).sort(function(a, b) {
	    return a[0] > b[0];
	  }).map(function(pair) {
	    return pair[0] + "=" + pair[1];
	  });
	}

	function mergeObjects(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var object = arguments[i];
	    for (var key in object) {
	      if (object.hasOwnProperty(key)) {
	        target[key] = object[key];
	      }
	    }
	  }

	  return target;
	}

	function getMD5(body) {
	  return crypto.createHash('md5').update(body, 'utf8').digest('hex');
	}

	function secureCompare(a, b) {
	  if (a.length !== b.length) {
	    return false;
	  }
	  var result = 0;
	  for (var i in a) {
	    result |= (a.charCodeAt(i) ^ b.charCodeAt(i));
	  }
	  return result === 0;
	}

	exports.toOrderedArray = toOrderedArray;
	exports.mergeObjects = mergeObjects;
	exports.getMD5 = getMD5;
	exports.secureCompare = secureCompare;


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Token = __webpack_require__(10);

	function Config(options) {
	  options = options || {};

	  this.host = options.host || "api.pusherapp.com";
	  this.scheme = options.scheme || (options.encrypted ? "https" : "http");
	  this.port = options.port;

	  this.appId = options.appId;
	  this.token = new Token(options.key, options.secret);

	  this.proxy = options.proxy;
	  this.timeout = options.timeout;
	  this.keepAlive = options.keepAlive;
	}

	Config.prototype.prefixPath = function(subPath) {
	  return "/apps/" + this.appId + subPath;
	};

	Config.prototype.getBaseURL = function(subPath, queryString) {
	  var port = this.port ? (':' + this.port) : '';
	  return this.scheme + '://' + this.host + port;
	};

	module.exports = Config;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var crypto = __webpack_require__(8);
	var Buffer = Buffer || __webpack_require__(11).Buffer;
	var util = __webpack_require__(7);

	/** Verifies and signs data against the key and secret.
	 *
	 * @constructor
	 * @param {String} key app key
	 * @param {String} secret app secret
	 */
	function Token(key, secret) {
	  this.key = key;
	  this.secret = secret;
	}

	/** Signs the string using the secret.
	 *
	 * @param {String} string
	 * @returns {String}
	 */
	Token.prototype.sign = function(string) {
	  return crypto.createHmac('sha256', this.secret)
	    .update(new Buffer(string, 'utf-8'))
	    .digest('hex');
	};

	/** Checks if the string has correct signature.
	 *
	 * @param {String} string
	 * @param {String} signature
	 * @returns {Boolean}
	 */
	Token.prototype.verify = function(string, signature) {
	  return util.secureCompare(this.sign(string), signature);
	};

	module.exports = Token;


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var errors = __webpack_require__(3);
	var util = __webpack_require__(7);

	var Token = __webpack_require__(10);

	/** Provides validation and access methods for a WebHook.
	 *
	 * Before accessing WebHook data, check if it's valid. Otherwise, exceptions
	 * will be raised from access methods.
	 *
	 * @constructor
	 * @param {Token} primary token
	 * @param {Object} request
	 * @param {Object} request.headers WebHook HTTP headers with lower-case keys
	 * @param {String} request.rawBody raw WebHook body
	 */
	function WebHook(token, request) {
	  this.token = token;

	  this.key = request.headers['x-pusher-key'];
	  this.signature = request.headers['x-pusher-signature'];
	  this.contentType = request.headers['content-type'];
	  this.body = request.rawBody;

	  if (this.isContentTypeValid()) {
	    try {
	      this.data = JSON.parse(this.body);
	    } catch(e) {}
	  }
	}

	/** Checks whether the WebHook has valid body and signature.
	 *
	 * @param {Token|Token[]} list of additional tokens to be validated against
	 * @returns {Boolean}
	 */
	WebHook.prototype.isValid = function(extraTokens) {
	  if (!this.isBodyValid()) {
	    return false;
	  }

	  extraTokens = extraTokens || [];
	  if (!(extraTokens instanceof Array)) {
	    extraTokens = [extraTokens];
	  }

	  var tokens = [this.token].concat(extraTokens);
	  for (var i in tokens) {
	    var token = tokens[i];
	    if (this.key == token.key && token.verify(this.body, this.signature)) {
	      return true;
	    }
	  }
	  return false;
	};

	/** Checks whether the WebHook content type is valid.
	 *
	 * For now, the only valid WebHooks have content type of application/json.
	 *
	 * @returns {Boolean}
	 */
	WebHook.prototype.isContentTypeValid = function() {
	  return this.contentType === "application/json";
	};

	/** Checks whether the WebHook content type and body is JSON.
	 *
	 * @returns {Boolean}
	 */
	WebHook.prototype.isBodyValid = function() {
	  return this.data !== undefined;
	};

	/** Returns all WebHook data.
	 *
	 * @throws WebHookError when WebHook is invalid
	 * @returns {Object}
	 */
	WebHook.prototype.getData = function() {
	  if (!this.isBodyValid()) {
	    throw new errors.WebHookError(
	      "Invalid WebHook body", this.contentType, this.body, this.signature
	    );
	  }
	  return this.data;
	};

	/** Returns WebHook events array.
	 *
	 * @throws WebHookError when WebHook is invalid
	 * @returns {Object[]}
	 */
	WebHook.prototype.getEvents = function() {
	  return this.getData().events;
	};

	/** Returns WebHook timestamp.
	 *
	 * @throws WebHookError when WebHook is invalid
	 * @returns {Date}
	 */
	WebHook.prototype.getTime = function() {
	  return new Date(this.getData().time_ms);
	};

	module.exports = WebHook;


/***/ }
/******/ ]);