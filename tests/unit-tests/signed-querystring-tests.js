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

vows.describe('SignedQueryString').addBatch({
  'when signing a query with body': {
    topic: function () { 
      return pusher;
    },

    'the body_md5 parameter is present in the querystring': function( pusher ) {
    	var queryString = pusher.createSignedQueryString( { path: '/event', body: "blah" } );
    	assert.match( queryString, /auth_signature=\w+$/ );
    }
  },

	'when signing a query with additional query parameters': {
    topic: function () { 
      return pusher;
    },

    'the additonal parameter is present in the querystring': function( pusher ) {
    	var queryString = pusher.createSignedQueryString( { path: '/event', params: { foo: 'bar' } } );
    	assert.match( queryString, /foo=bar/ );
    },

    'the auth_key parameter cannot be overidden': function( pusher ) {
    	assert.throws( createQueryStringWithDisallowedParameter( pusher, 'auth_key' ) );
    },

    'the auth_timestamp parameter cannot be overidden': function( pusher ) {
    	assert.throws( createQueryStringWithDisallowedParameter( pusher, 'auth_timestamp' ) );
    },

    'the auth_version parameter cannot be overidden': function( pusher ) {
    	assert.throws( createQueryStringWithDisallowedParameter( pusher, 'auth_version' ) );
    },

    'the body_md5 parameter cannot be overidden': function( pusher ) {
    	assert.throws( createQueryStringWithDisallowedParameter( pusher, 'body_md5' ) );
    }

  }

}).export( module );

function createQueryStringWithDisallowedParameter( pusher, paramName ) {
	var createQueryString = function() {
		var params = {};
		params[ paramName ] = 'foo';
  	pusher.createSignedQueryString( { path: '/event', params: params, body: 'blah' } );
  };
  return createQueryString;
}