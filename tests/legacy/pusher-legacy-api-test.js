var vows = require('vows'),
    assert = require('assert'),
    Pusher = require('../../lib/pusher'),
    fs = require('fs');

var data = fs.readFileSync(__dirname + '/../config.json');
var config = JSON.parse( data) ;

var expectedOptions = {
		  appId: config.pusher.id,
		  key: config.pusher.key,
		  secret: config.pusher.secret
		};

vows.describe('Legacy').addBatch({

  'when creating a new Pusher instance with appKey option': {
    topic: function () { 

    	var pusher = new Pusher({
			  appId:  config.pusher.id,
			  appKey: config.pusher.key,
			  secret: config.pusher.secret
			});

			return pusher;
    },

    'key is set with value of options.appKey': function( pusher ) {
    	assert.equal( pusher.options.key, expectedOptions.key );
    },

    'appKey value is removed': function( pusher ) {
    	assert.equal( pusher.options.appKey, undefined );
    }
  },

  'when creating a new Pusher instance': {
  	topic: function() {
    	var pusher = new Pusher({
			  appId:  config.pusher.id,
			  appKey: config.pusher.key,
			  secret: config.pusher.secret
			});

			return pusher;
  	},

  	'a channel object can be accessed': function( pusher ) {
  		var channel = pusher.channel( 'my_channel' );
  		assert.isObject( channel );
  	},

  	'a channel object can be used to trigger an event': function( pusher ) {
  		var channel = pusher.channel( 'my_channel' );
  		assert.isFunction( channel.trigger );
  	}
  },

  'when triggering an event on a channel': {
    topic: function () {
    	var pusher = new Pusher({
			  appId:  config.pusher.id,
			  appKey: config.pusher.key,
			  secret: config.pusher.secret
			});
    	var channel = pusher.channel( 'test_channel' );
			channel.trigger( 'my_event', { "hello": "world" }, this.callback );
    },

    'the REST API call is successful': function(err, req, res) {
    	assert.equal( res.statusCode, 200 );
    }
  }

}).export( module );