var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe("constructor attributes", function() {
    it("should support `appId`", function() {
      var pusher = new Pusher({ appId: 12345 });
      expect(pusher.config.appId).to.equal(12345);
    });

    it("should support `token`", function() {
      var pusher = new Pusher({
        key: "1234567890abcdef",
        secret: "fedcba0987654321"
      });
      expect(pusher.config.token.key).to.equal("1234567890abcdef");
      expect(pusher.config.token.secret).to.equal("fedcba0987654321");
    });

    it("should default `encrypted` to false", function() {
      var pusher = new Pusher({});
      expect(pusher.config.scheme).to.equal("http");
    });

    it("should support `encrypted`", function() {
      var pusher = new Pusher({ encrypted: true });
      expect(pusher.config.scheme).to.equal("https");
    });

    it("should default `host` to 'api.pusherapp.com'", function() {
      var pusher = new Pusher({});
      expect(pusher.config.host).to.equal("api.pusherapp.com");
    });

    it("should support `host`", function() {
      var pusher = new Pusher({ host: "example.org" });
      expect(pusher.config.host).to.equal("example.org");
    });

    it("should support `cluster`", function () {
      var pusher = new Pusher({cluster: 'eu'});
      expect(pusher.config.host).to.equal('api-eu.pusher.com')
    });

    it("should have `host` override `cluster`", function () {
      var pusher = new Pusher({host: 'api.staging.pusher.com', cluster: 'eu'});
      expect(pusher.config.host).to.equal('api.staging.pusher.com');
    });

    it("should default `port` to undefined", function() {
      var pusher = new Pusher({ encrypted: true });
      expect(pusher.config.port).to.be(undefined);
    });

    it("should support `port`", function() {
      var pusher = new Pusher({ port: 8080 });
      expect(pusher.config.port).to.equal(8080);

      pusher = new Pusher({ encrypted: true, port: 8080 });
      expect(pusher.config.port).to.equal(8080);
    });

    it("should default `proxy` to `undefined`", function() {
      var pusher = new Pusher({});
      expect(pusher.config.proxy).to.be(undefined);
    });

    it("should support `proxy`", function() {
      var pusher = new Pusher({ proxy: "https://test:tset@example.com" });
      expect(pusher.config.proxy).to.equal("https://test:tset@example.com");
    });

    it("should default `timeout` to `undefined`", function() {
      var pusher = new Pusher({});
      expect(pusher.config.timeout).to.be(undefined);
    });

    it("should support `timeout`", function() {
      var pusher = new Pusher({ timeout: 1001 });
      expect(pusher.config.timeout).to.equal(1001);
    });
  });
});
