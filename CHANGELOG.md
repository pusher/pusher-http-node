## 3.0.0 (2019-09-26)
[REMOVED] Support for Node versions < 8

[UPGRADED] Upgraded versions of `nock`, and `mocha`

## 2.2.2 (2019-07-31)

[FIXED] an issue where a function that generated signatures behaved differently in different versions of node. Improved the underlying compare function to unify behaviour between versions.

[ADDED] Supported platforms to the Readme and TravisCI config.

## 2.2.1 (2019-07-03)

no-op release to fix the description on https://www.npmjs.com/package/pusher

## 2.2.0 (2018-11-26)

[ADDED] This release adds support for end-to-end encryption, a new feature for Channels. Read more [in our docs](https://pusher.com/docs/client_api_guide/client_encrypted_channels).

[DEPRECATED] Renamed `encrypted` option to `useTLS` - `encrypted` will still work!

## 2.1.4 (2018-11-22)

[UPGRADED] Upgraded versions of `request`, `nock`, and `mocha`

## 2.1.3 (2018-08-21)

[FIXED] incorrect channels limit when triggering

## 2.1.2 (2018-07-27)

[FIXED] typescript dependency issue

## 2.1.1 (2018-07-27)

[ADDED] typescript type declarations file

## 2.0.1 (2018-07-04)

no-op release to remove some files from npm

## 2.0.0 (2018-05-08)

[FIXED] remove security vulnerability by updating requests.

[REMOVED] support for versions of node < 4

## 1.5.1 (2016-12-01)

[FIXED] fix the version of request we are using, new minor version break backwards compatibility

## 1.5.0 (2016-08-23)

[ADDED] support for publishing on up to 10 interests.

## 1.4.0 (2016-08-15)

[ADDED] support for sending push notifications.

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
