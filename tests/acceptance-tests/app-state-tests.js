var vows = require('vows'),
    assert = require('assert'),
    Pusher = require('../../lib/pusher'),
    fs = require('fs');

var data = fs.readFileSync(__dirname + '/../config.json');
var config = JSON.parse( data);

var pusher = new Pusher({
					  appId: config.pusher.id,
					  key: config.pusher.key,
					  secret: config.pusher.secret
					});

vows.describe('AppState').addBatch({
  'when querying channels in an app': {
    topic: function () { 
      pusher.get( { path: '/channels' }, this.callback );
    },

    'the REST API call is successful': function(err, req, res) {
      assert.equal( res.statusCode, 200 );
    },

    'the REST API call returns channel information JSON in the body': function(err, req, res) {
      assert.isObject( JSON.parse( res.body ).channels );
    }
  }
}).export( module );