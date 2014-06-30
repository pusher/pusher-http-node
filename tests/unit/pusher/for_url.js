var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe(".forUrl", function() {
    it("should set `appId`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.appId).to.equal(4321);
    });

    it("should set `token`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.token.key).to.equal("123abc");
      expect(pusher.config.token.secret).to.equal("def456");
    });

    it("should set `scheme`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.scheme).to.equal("https");
    });

    it("should set `host`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.host).to.equal("example.org");
    });

    it("should set `port` if specified", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org:999/apps/4321");
      expect(pusher.config.port).to.equal(999);
    });

    it("should default `port` to undefined", function() {
      var pusher = Pusher.forURL("http://123abc:def456@example.org/apps/4321");
      expect(pusher.config.port).to.be(undefined);
    });
  });
});
