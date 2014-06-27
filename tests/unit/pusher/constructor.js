var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe("constructor attributes", function() {
    it("should support `appId`", function() {
      var pusher = new Pusher({ appId: 12345 });
      expect(pusher.appId).to.equal(12345);
    });

    it("should support `token`", function() {
      var pusher = new Pusher({
        key: "1234567890abcdef",
        secret: "fedcba0987654321"
      });
      expect(pusher.token.key).to.equal("1234567890abcdef");
      expect(pusher.token.secret).to.equal("fedcba0987654321");
    });

    it("should default `scheme` to 'http'", function() {
      var pusher = new Pusher({});
      expect(pusher.scheme).to.equal("http");
    });

    it("should support `scheme`", function() {
      var pusher = new Pusher({ scheme: "https" });
      expect(pusher.scheme).to.equal("https");
    });

    it("should default `host` to 'api.pusherapp.com'", function() {
      var pusher = new Pusher({});
      expect(pusher.host).to.equal("api.pusherapp.com");
    });

    it("should support `host`", function() {
      var pusher = new Pusher({ host: "example.org" });
      expect(pusher.host).to.equal("example.org");
    });

    it("should default `port` to 80 for http", function() {
      var pusher = new Pusher({ scheme: "http" });
      expect(pusher.port).to.equal(80);
    });

    it("should default `port` to 443 for https", function() {
      var pusher = new Pusher({ scheme: "https" });
      expect(pusher.port).to.equal(443);
    });

    it("should support `port`", function() {
      var pusher = new Pusher({ port: 8080 });
      expect(pusher.port).to.equal(8080);

      pusher = new Pusher({ scheme: "https", port: 8080 });
      expect(pusher.port).to.equal(8080);
    });

    it("should default `proxy` to `undefined`", function() {
      var pusher = new Pusher({});
      expect(pusher.proxy).to.be(undefined);
    });

    it("should support `proxy`", function() {
      var pusher = new Pusher({ proxy: "https://test:tset@example.com" });
      expect(pusher.proxy).to.equal("https://test:tset@example.com");
    });

    it("should default `timeout` to `undefined`", function() {
      var pusher = new Pusher({});
      expect(pusher.timeout).to.be(undefined);
    });

    it("should support `timeout`", function() {
      var pusher = new Pusher({ timeout: 1001 });
      expect(pusher.timeout).to.equal(1001);
    });
  });
});
