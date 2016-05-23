## 1.3.0 (2016-05-24)

[ADDED] Support for triggering batch events.

## 1.2.1 (2016-03-03)

[FIXED] remove security vulnerability by updating requests.

## 1.2.0 (2016-02-16)

[ADDED] `cluster` option in the Pusher constructor.

## 1.1.0 (2016-01-05)

[ADDED] Build option for Parse Cloud.

## 1.0.6 (2015-05-18)

[FIXED] compatibility issue with node 0.12 (issue #12)

Optimisation: Use Date.now() instead of (new Date).getTime()

Run tests with Travis-CI

## 1.0.5 (2015-05-12)

[FIXED] Add validation to channel names and socket ids

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
