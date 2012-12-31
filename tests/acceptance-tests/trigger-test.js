var vows = require('vows'),
    assert = require('assert'),
    Pusher = require('../../lib/pusher'),
    fs = require('fs');

var data = fs.readFileSync(__dirname + '/../config.json');
var config = JSON.parse( data);

var orgRequestModule = Pusher.modules.request;

var pusher = new Pusher({
					  appId: config.pusher.id,
					  key: config.pusher.key,
					  secret: config.pusher.secret
					});

vows.describe('Trigger').addBatch({
  'when triggering a data structure': {
    topic: function () { 
      pusher.trigger( 'test_channel', 'my_event', { "hello": "world" }, null, this.callback );
    },

    'the REST API call is successful': function(err, req, res) {
      assert.equal( res.statusCode, 200 );
    }
  },
  'when triggering a String': {
    topic: function () { 
      pusher.trigger( 'test_channel', 'my_event', "Hello World", null, this.callback );
    },

    'the REST API call is successful': function(err, req, res) {
      assert.equal( res.statusCode, 200 );
    }
  },
  'when triggering a string over 10kB': {
  	topic: function() {
  		var buf = new Buffer(1024*11);
  		var str = buf.toString();

  		pusher.trigger( 'test_channel', 'my_event', str, null, this.callback );
  	},

  	'the REST API call will return 413': function(err, req, res) {
      assert.equal( res.statusCode, 413 );
    } 
  },
  'when triggering over HTTPS': {
    topic: function () {
      pusher.scheme = 'https';
      pusher.port = 443;
      pusher.trigger( 'test_channel', 'my_event', { "hello": "world" }, null, this.callback );
    },

    'the REST API call is successful': function(err, req, res) {
      assert.equal( res.statusCode, 200 );
    },

    teardown: function() {
      pusher.scheme = 'http';
      pusher.port = 80;
    }
  },

  'when triggering to multiple channels': {
    topic: function() {
      var channels = [ 'test-channel-1', 'test-channel-2' ];
      pusher.trigger( channels, 'my_event', { "hello": "world" }, null, this.callback );
    },

    'the REST API call is successful': function( err, req, res ) {
      assert.equal( res.statusCode, 200 );
    }
  }
}).export( module );