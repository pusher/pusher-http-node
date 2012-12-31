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
	'when triggering with no callback': {
		topic: function() {
			return pusher;
		},

		'callback is not attempted': function( pusher ) {
			Pusher.modules.request = {
					post: function( options, callback ) {
						callback();
				}
			};

			pusher.trigger( 'test_channel', 'my_event', { some: 'data '} );
		},

		teardown: function() {
			Pusher.modules.request = orgRequestModule;
		}
	},
	'when triggering with socketId': {
		topic: function() {
			return pusher;
		},

		'socket_id parameter is present within request': function( pusher ) {
			var socketId = '12345';
			Pusher.modules.request = {
				post: function( options, callback ) {
					assert.equal( JSON.parse( options.body ).socket_id, socketId );
				}
			};

			pusher.trigger( 'test_channel', 'my_event', { some: 'data '}, socketId );
		},

		teardown: function() {
			Pusher.modules.request = orgRequestModule;
		}
	},

	'when triggering': {
		topic: function() {
			return pusher;
		},

		'a single channel String as channels parameter is converted to an Array with one element': function( pusher ) {

			var channelName = 'my-channel';

			Pusher.modules.request = {
				post: function( options, callback ) {
					assert.equal( JSON.parse( options.body ).channels.length, 1 );
					assert.equal( JSON.parse( options.body ).channels[0], channelName );
				}
			};

			pusher.trigger( channelName, 'my_event', { "hello": "world" } );
		},

		'the URL called is in the expected format': function( pusher ) {

			Pusher.modules.request = {
				post: function( options, callback ) {
					assert.include( options.url, 'http://api.pusherapp.com/apps/' + config.pusher.id + '/events?' );
					assert.include( options.url, 'auth_key=' + config.pusher.key );
					assert.match( options.url, /auth_signature=\w+(&|$)/ );
					assert.match( options.url, /auth_timestamp=\w+(&|$)/ );
					assert.include( options.url, 'auth_version=1.0' );
				}
			};

			var channels = [ 'test-channel-1', 'test-channel-2' ];
			pusher.trigger( channels, 'my_event', { "hello": "world" } );
		},

		'the URL called is in the expected format when socket_id is sent': function( pusher ) {

			var socketId = '12345';

			Pusher.modules.request = {
				post: function( options, callback ) {
					assert.include( options.url, 'http://api.pusherapp.com/apps/' + config.pusher.id + '/events?' );
					assert.include( options.url, 'auth_key=' + config.pusher.key );
					assert.match( options.url, /auth_signature=\w+(&|$)/ );
					assert.match( options.url, /auth_timestamp=\w+(&|$)/ );
					assert.include( options.url, 'auth_version=1.0' );
				}
			};

			var channels = [ 'test-channel-1', 'test-channel-2' ];
			pusher.trigger( channels, 'my_event', { "hello": "world" } );
		},

		'the POST body is in the expected format': function( pusher ) {
			
			var channels = [ 'test-channel-1', 'test-channel-2' ];

			var expectedData = { "hello": "world" };
			var expectedBodyStructure = {
				"name": "my_event",
				"data": JSON.stringify( expectedData ),
				"channels": channels
			};
			var expectedBody = JSON.stringify( expectedBodyStructure );

			Pusher.modules.request = {
				post: function( options, callback ) {
					var body = options.body;

					assert.equal( body, expectedBody );
				}
			};

			pusher.trigger( channels, 'my_event', expectedData );
		},

		'the POST body is in the expected format when socket_id is sent': function( pusher ) {

			var socketId = '12345';
			var channels = [ 'test-channel-1', 'test-channel-2' ];

			var expectedData = { "hello": "world" };
			var expectedBodyStructure = {
				"name": "my_event",
				"data": JSON.stringify( expectedData ),
				"channels": channels,
				"socket_id": socketId
			};
			var expectedBody = JSON.stringify( expectedBodyStructure );

			Pusher.modules.request = {
				post: function( options, callback ) {
					var body = options.body;

					assert.equal( body, expectedBody );
				}
			};

			pusher.trigger( channels, 'my_event', expectedData, socketId );
		},

		teardown: function() {
			Pusher.modules.request = orgRequestModule;
		}
	}

}).export( module );