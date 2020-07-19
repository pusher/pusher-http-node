module.exports = ParseRequest = {
  get: function (params, callback) {
    this._request("GET", params, callback);
  },

  post: function (params, callback) {
    this._request("POST", params, callback);
  },

  _request: function (method, params, callback) {
    var request = {
      method: method,
      headers: params.headers,
      body: params.body,
    };

    var success = function (res) {
      var err = null;
      var res = new ParseResponse(res);
      var body = res.body;
      callback(err, res, body);
    };

    var error = function (res) {
      var res = new ParseResponse(res);
      var err = (body = res.body);
      callback(err, res, body);
    };

    fetch(params.url, request).then(success).catch(error);
  },

  forever: function () {
    return this;
  },
};

function ParseResponse(raw) {
  this.statusCode = raw.status;
  this.body = raw.body;

  // For convenience, expose some Response helper methods.
  this.text = () => raw.text();
  this.json = () => raw.json();
}
