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
    console.log("This Parse extension does not support keep-alive." +
      " Falling back to default...");
    return this;
  }
}

function ParseResponse(raw){
  this.statusCode = raw.status;
  this.body = raw.text;
}