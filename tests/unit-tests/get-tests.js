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

	'when using get with additional parameters': {
		topic: function() {
			return pusher;
		},

		'the parameters are included in the querystring': function( pusher ) {

			Pusher.modules.request = {
				get: function( options, callback ) {
					assert.match( options.url, /filter_by_prefix=presence\-(&|$)/ );
					assert.match( options.url, /info=user_count,subscription_count(&|$)/ );
				}
			};

			pusher.get(
				{
					path: '/channels', 
					params: {
						"filter_by_prefix": "presence-",
						"info": "user_count,subscription_count"
					}
				}
			);
		},

		teardown: function() {
			Pusher.modules.request = orgRequestModule;
		}
	}

}).export( module );