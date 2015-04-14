# Changelog

## 2.0.0 (2015-04-13)

[ADDED] Event IDs can now be retreived when triggering events via `trigger`. For more information see https://pusher.com/docs/event_buffer 

[CHANGED] The `trigger` callback function parameters have been changed. The 2nd parameter is now the parsed body from the HTTP response to allow you to access the event IDs of triggered events.

[FIXED] `Pusher` constructor configuration is now validated and an Error is thrown if `config.appId`, `config.key` and `config.secret` are invalid.

## 1.0.4 (2015-02-13)

[FIXED] Auth signatures being incorrect when channel data included utf-8 characters

## 1.0.3 (2015-01-28)

[FIXED] Fixed trigger not accepting '=', '@', ',', '.' and ';' in channel names

## 1.0.2 (2014-10-23)

[FIXED] Upgraded `request` to 2.45.0 to prevent DoS vulnerability caused by `qs` dependency.

## 1.0.1 (2014-08-11)

[CHANGED] Incorrect arguments to `authenticate` will raise an error

## 1.0.0 (2014-07-14)

First stable release.
