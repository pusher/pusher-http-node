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
            assert.include( options.url, '&socket_id=' + socketId );
          }
        };

        pusher.trigger( 'test_channel', 'my_event', { some: 'data '}, socketId );
      },

      teardown: function() {
        Pusher.modules.request = orgRequestModule;
      }
    }
}).export( module );