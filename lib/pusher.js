module.exports = (function() {
  var crypto = require('crypto');
  var request = require('request');

  var Pusher = function(options) {
    this.options = options;

    // support appKey being provided instead of key for legacy support
    if( this.options.appKey ) {
      this.options.key = this.options.appKey;
      delete this.options.appKey;
    }

    return this;
  };

  /**
   * @private
   * Used for testing so that modules can be overidden.
   */
  Pusher.modules = {
    request: request,
    crypto: crypto
  };

  Pusher.prototype = {
    domain: 'api.pusherapp.com',
    scheme: 'http',
    port: 80
  };

  Pusher.prototype.auth = function(socketId, channel, channelData) {
    var returnHash = {}
    var channelDataStr = ''
    if (channelData) {
      channelData = JSON.stringify(channelData);
      channelDataStr = ':' + channelData;
      returnHash['channel_data'] = channelData;
    }
    var stringToSign = socketId + ':' + channel + channelDataStr;
    returnHash['auth'] = this.options.key + ':' + crypto.createHmac('sha256', this.options.secret).update(stringToSign).digest('hex');
    return(returnHash);
  };

  /**
   * Legacy supporting function for fetching a channel object.
   */
  Pusher.prototype.channel = function( channelName ) {
    return new Channel( channelName, this );
  };

  Pusher.prototype.trigger = function(channels, event, message, socketId, callback) {

    if( ( channels instanceof Array ) === false ) {
      // add single channel to array for multi trigger compatibility
      channels = [ channels ];
    }

    var eventData = {
      "name": event,
      "data": ( typeof message === 'object' ? JSON.stringify( message ) : message ),
      "channels": channels
    };

    if( socketId ) {
      eventData.socket_id = socketId;
    }

    return this.post( { path: '/events', body: eventData }, callback );
  };

  /**
   * Make a post request to Pusher. Authentication is handled for you.
   * 
   * @param {{
   *  path: String, // the path for the request
   *  body: String  // the body of the request
   * }} options
   * @param {Function} callback called when the post has completed
   */
  Pusher.prototype.post = function( options, callback ) {
    var path = '/apps/' + this.options.appId + options.path;
    var requestBody = JSON.stringify( options.body );
    var queryString = this.createSignedQueryString( { method: 'POST', path: path, body: requestBody } );

    var url = this.scheme + '://' + this.domain + ( this.port === 80? '' : ':' + this.port ) + path;
    url += '?' + queryString

    Pusher.modules.request.post({
      url: url,
      headers: {
        'content-type': 'application/json'
      },
      body: requestBody
    }, function( err, res, resBody ) {
      // although using request module the callback signature
      // needs to be maintained
      if( typeof callback === 'function' ) {
        callback( err, this.req, res );
      }
    });

    return this;
  };

  /**
   * Make a post request to Pusher. Authentication is handled for you.
   * 
   * @param {{
   *  path: String, // the path for the request
   * }} options
   */
  Pusher.prototype.get = function( options, callback ) {
    var path = '/apps/' + this.options.appId + options.path;
    var queryString = this.createSignedQueryString( { method: 'GET', path: path, params: options.params } );

    var url = this.scheme + '://' + this.domain + ( this.port === 80? '' : ':' + this.port ) + path;
    url += '?' + queryString

    Pusher.modules.request.get({
      url: url,
    }, function( err, res, resBody ) {
      if( typeof callback === 'function' ) {
        callback( err, this.req, res );
      }
    });

    return this;
  };

  /**
   * Create a query string which has been signed and can be used when making a request to Pusher.
   *
   * @param {{
   *  method: String, // GET or POST
   *  body: String,   // body, required if making a POST
   *  params: Object  // key value pairs for parameters
   * }} options
   */
  Pusher.prototype.createSignedQueryString = function( options ) {

    var timestamp = parseInt(new Date().getTime() / 1000);

    var params = {};
    params[ 'auth_key' ] = this.options.key;
    params[ 'auth_timestamp' ] = timestamp;
    params[ 'auth_version' ] = '1.0';

    if( options.body ) {
      var hash = Pusher.modules.crypto.createHash('md5').update(options.body, 'utf8').digest('hex');
      params[ 'body_md5' ] = hash;
    }

    if( options.params ) {
      for( var name in options.params ) {
        if( params[ name ] !== undefined ) {
          throw Error( name + ' is a required parameter and cannot be overidden' );
        }
        params[ name ] = options.params[ name ];
      }
    }

    var sortedKeyVal = toOrderedArray( params );
    var queryString = sortedKeyVal.join( '&' );

    var signData = [ options.method, options.path, queryString ].join('\n');
    var signature = Pusher.modules.crypto.createHmac('sha256', this.options.secret).update(signData).digest('hex');

    queryString += '&auth_signature=' + signature;

    return queryString;
  };

  /**
   * Channel object used for legacy support. Should not be extended.
   */
  function Channel( channelName, pusher ) {
    this._channelName = channelName;
    this._pusher = pusher;
  }

  /**
   * Trigger an event on a channel.
   */
  Channel.prototype.trigger = function( event, message, callback ) {
    var socketId = null;
    this._pusher.trigger( this._channelName, event, message, socketId, callback );
  };

  /* Utility */
  function toOrderedArray( map ) {
    var items = [];
    for( var name in map ) {
      items.push( name + '=' + map[ name ] );
    }
    items.slice(0).sort(function(a, b) {
      return a - b;
    });
    return items;
  }

  return Pusher;
})();