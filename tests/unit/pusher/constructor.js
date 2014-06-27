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

    describe("cluster configuration", function() {
      it("should generate a hostname for the cluster", function() {
        var pusher = new Pusher({ cluster: "test" });
        expect(pusher.host).to.equal("api-test.pusher.com");
      });
    });

    describe("url configuration", function() {
      it("should set `appId`", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.appId).to.equal(4321);
      });

      it("should set `token`", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.token.key).to.equal("123abc");
        expect(pusher.token.secret).to.equal("def456");
      });

      it("should set `scheme`", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.scheme).to.equal("https");
      });

      it("should set `host`", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.host).to.equal("example.org");
      });

      it("should set `port` to 80 for http if not specified", function() {
        var pusher = new Pusher({
          url: "http://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.port).to.equal(80);
      });

      it("should set `port` to 443 for http if not specified", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org/apps/4321"
        });
        expect(pusher.port).to.equal(443);
      });

      it("should set `port` if specified", function() {
        var pusher = new Pusher({
          url: "https://123abc:def456@example.org:999/apps/4321"
        });
        expect(pusher.port).to.equal(999);
      });
    });
  });
});
