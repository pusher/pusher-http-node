# Pusher node.js Server library

This is a node.js library for interacting with the Pusher REST API.

Registering at <http://pusher.com> and use the application credentails within your app as shown below.

## Installation
```
$ npm install pusher
```

## How to use

### Constructor

```javascript
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: 'YOUR_PUSHER_APP_ID',
  key: 'YOUR_PUSHER_APP_KEY',
  secret: 'YOUR_PUSHER_SECRET_KEY'
});
```

### Publishing/Triggering events

To trigger an event on one or more channels use the trigger function.

#### A single channel

```javascript
pusher.trigger( 'channel-1', 'test_event', { message: "hello world" } );
```

#### Multiple channels

```javascript
pusher.trigger( [ 'channel-1', 'channel-2' ], 'test_event', { message: "hello world" } );
```

### Excluding event recipients

In order to avoid the person that triggered the event also receiving it the `trigger` function can take an optional `socketId` parameter. For more informaiton see: <http://pusher.com/docs/publisher_api_guide/publisher_excluding_recipients>.

```javascript
var socketId = '1302.1081607';

pusher.trigger(channel, event, data, socketId);
```

### Authenticating Private channels

To authorise your users to access private channels on Pusher, you can use the `auth` function:

```javascript
var auth = pusher.auth( socketId, channel );
```

For more information see: <http://pusher.com/docs/authenticating_users>

### Authenticating Presence channels

Using presence channels is similar to private channels, but you can specify extra data to identify that particular user:

```javascript
var channelData = {
	user_id: 'unique_user_id',
	user_info: {
	  name: 'Phil Leggetter'
	  twitter_id: '@leggetter'
	}
};
var auth = pusher.auth( socketId, channel, channelData );
```

The `auth` is then returned to the caller as JSON.

For more information see: <http://pusher.com/docs/authenticating_users>

### Application State

It's possible to query the state of the application using the `pusher.get` function.
```javascript
pusher.get( { path: path, params: params }, callback );
```
The `path` property identifies the resource that the request should be made to and the `params` property should be a map of additional querystring key and value pairs.

The following example provides the signature of the callback and an example of parsing the result:
```javascript
pusher.get( { path: '/channels', params: {} }, function( error, request, response ) {
	if( response.statusCode === 200 ) {
		var result = JSON.parse( response.body );
		var channelsInfo = result.channels;
	}
});
```

#### Get list of channels in an application
```javascript
pusher.get( { path: '/channels', params: params }, callback );
```

Information on the optional `params` option property and the structure of the returned JSON is defined in the [REST API reference](http://pusher.com/docs/rest_api#method-get-channels).

#### Get single channel state
```javascript
pusher.get( { path: '/channels/[channel_name]', params: params }, callback );
```

Information on the optional `params` option property and the structure of the returned JSON is defined in the [REST API reference](http://pusher.com/docs/rest_api#method-get-channel).

#### Get list of users on a presence channel
```javascript
pusher.get( { path: '/channels/[channel_name]/users' }, callback );
```

The `channel_name` in the path must be a [presence channel](http://pusher.com/docs/presence). The structure of the returned JSON is defined in the [REST API reference](http://pusher.com/docs/rest_api#method-get-users).

## Tests

The tests run using [Vows](http://vowsjs.org/) and were added in 0.0.3. To run:

1. `cp tests/config.example.json tests/config.json` and update with your own Pusher application credentials.
2. `npm update` to ensure you have vows in `node_modules`
3. Run the tests using `node_modules/vows/bin/vows tests/*/*.js`

## Credits

This library is based on the work of:
* Christian Bäuerlein and his library pusher.
* Jaewoong Kim and the node-pusher library.

## License

This code is free to use under the terms of the MIT license.
