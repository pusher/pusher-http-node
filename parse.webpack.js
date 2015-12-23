/*
Bundler used to create the Parse Cloud module.
 */

var path = require('path');

module.exports = {
  entry: "./lib/pusher",
  output: {
    library: "Pusher",
    path: path.join(__dirname, "./parse_cloud"),
    libraryTarget: "commonjs2",
    filename: "pusher.js"
  },
  target: "node",
  resolve: {
    alias: {
      request: "./parse_cloud/request"
    }
  }
}