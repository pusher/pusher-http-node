/*
Bundler used to create the Fetch module.
 */

var path = require("path");

module.exports = {
  entry: "./lib/pusher",
  output: {
    library: "Pusher",
    path: __dirname,
    libraryTarget: "commonjs2",
    filename: "fetch.js",
  },
  target: "node",
  resolve: {
    alias: {
      request: "./fetch/request",
    },
  },
  externals: {
    "./version": "var { 'version' : '" + require("./package").version + "'}",
  },
};
