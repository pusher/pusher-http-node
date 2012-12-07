var vows = require('vows'),
    assert = require('assert'),
    Pusher = require('../lib/pusher'),
    fs = require('fs');

var data = fs.readFileSync(__dirname + '/config.json');
var config = JSON.parse( data) ;

var expectedOptions = {
		  appId: config.pusher.id,
		  key: config.pusher.key,
		  secret: config.pusher.secret
		};

vows.describe('Legacy').addBatch({
    'when creating a new Pusher instance': {
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
    }
}).export( module );