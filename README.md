# A node library for Pusher API

## Installation
```
$ npm install node-pusher
```

## How to use

```javascript
var Pusher = require('node-pusher');

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

// (optional) socket_id is used to prevent getting message for myself
// http://pusher.com/docs/publisher_api_guide/publisher_excluding_recipients
var socket_id = '1302.1081607';

pusher.trigger(channel, event, data, socket_id, function(err, req, res) {
  // do something (this callback is optional)
});

// auth function returns the object with the auth field which can be returned from our sever
// to authorize the socket to subscribe to a private or presence channel
// http://pusher.com/docs/auth_signatures
pusher.auth(socket_id, channel, channelData);
```

## Credits

This library is based on the work of Christian Bäuerlein and his library pusher

## License

This code is free to use under the terms of the MIT license.
