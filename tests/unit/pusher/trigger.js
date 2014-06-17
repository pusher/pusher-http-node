var expect = require("expect.js");
var nock = require("nock");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 1234, key: "f00d", secret: "beef" });
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe("#trigger", function() {
    it("should send the event when no callback is given", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "});
      setTimeout(function() {
        // we have no callback in this test, so we wait until the next tick
        expect(mock.isDone()).to.be(true);
        done();
      }, 0);
    });

    it("should send the event to a single channel", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=e95168baf497b2e54b2c6cadd41a6a3f&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["one"] }
        )
        .reply(200, "{}");

      pusher.trigger("one", "my_event", { some: "data "}, null, done);
    });

    it("should send the event to multiple channels", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=530dac0aa045e5f8e51c470aed0ce325&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["one", "two", "three"] }
        )
        .reply(200, "{}");

      pusher.trigger(["one", "two", "three"], "my_event", { some: "data "}, null, done);
    });

    it("should raise an error when sending to more than 10 channels");
    it("should call back");

    it("should serialize arrays into JSON", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=18e64b2fed38726915d79ebb4f8feb5b&auth_signature=Y",
          { name: "my_event", data: "[1,2,4]", channels: ["one"] }
        )
        .reply(200, "{}");

      pusher.trigger("one", "my_event", [1,2,4], null, done);
    });

    it("should not serialize strings into JSON", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=f358a562d00e1bfe1859132d932cd706&auth_signature=Y",
          { name: "test_event", data: "test string", channels: ["test"] }
        )
        .reply(200, "{}");

      pusher.trigger("test", "test_event", "test string", null, done);
    });

    it("should add socket_id to the request body", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", done);
    });

    it("should respect the scheme, host and port config", function(done) {
      var pusher = new Pusher({
        appId: 1234,
        key: "f00d",
        secret: "beef",
        scheme: "https",
        host: "example.com",
        port: 1234
      });
      var mock = nock("https://example.com:1234")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", done);
    });
  });
});
