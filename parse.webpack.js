/*
Bundler used to create the Parse Cloud module.
 */

var path = require('path');

module.exports = {
  entry: "./lib/pusher",
  output: {
    library: "Pusher",
    path: __dirname,
    libraryTarget: "commonjs2",
    filename: "parse.js"
  },
  target: "node",
  resolve: {
    alias: {
      request: "./parse_cloud/request"
    }
  },
  externals: {
    "./version": "var { 'version' : '" + require('./package').version + "'}"
  }
}