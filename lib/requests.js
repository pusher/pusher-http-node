var request = require('request');

var errors = require('./errors');
var util = require('./util');

var pusherLibraryVersion = require('./version');

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
    timeout: config.timeout,
    headers: {
      'x-pusher-library': 'pusher-http-node ' + pusherLibraryVersion
    }
  };

  if(body) {
    params.headers['content-type'] = 'application/json';
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
