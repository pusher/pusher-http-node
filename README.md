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

var channel = 'lobby';
var event = 'message';
var data = {
  from: 'Jaewoong',
  content: 'Hello, World'
};
```

### Publishing/Triggering events

To trigger an event on one or more channels use the trigger function.

#### A single channel

```
pusher.trigger( 'channel-1', 'test_event', { message: "hello world" } );
```

#### Multiple channels

```
pusher.trigger( [ 'channel-1', 'channel-2' ], 'test_event', { message: "hello world" } );
```

### Excluding event recipients

In order to avoid the person that triggered the event also receiving it the `trigger` function can take an optional `socketId` parameter. For more informaiton see: <http://pusher.com/docs/publisher_api_guide/publisher_excluding_recipients>.

```
var socketId = '1302.1081607';

pusher.trigger(channel, event, data, socketId);
```

### Authenticating Private channels

To authorise your users to access private channels on Pusher, you can use the `auth` function:

```
var auth = pusher.auth( socketId, channel );
```

For more information see: <http://pusher.com/docs/authenticating_users>

### Authenticating Presence channels

Using presence channels is similar to private channels, but you can specify extra data to identify that particular user:

```
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
