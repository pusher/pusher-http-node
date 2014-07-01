var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe(".forUrl", function() {
    it("should set the `appId` attribute", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.appId).to.equal(4321);
    });

    it("should set the `token` attribute", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.token.key).to.equal("123abc");
      expect(pusher.config.token.secret).to.equal("def456");
    });

    it("should set the `scheme` attribute", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.scheme).to.equal("https");
    });

    it("should set the `host` attribute", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.config.host).to.equal("example.org");
    });

    it("should set the `port` attribute if specified", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org:999/apps/4321");
      expect(pusher.config.port).to.equal(999);
    });

    it("should default the `port` attribute to undefined", function() {
      var pusher = Pusher.forURL("http://123abc:def456@example.org/apps/4321");
      expect(pusher.config.port).to.be(undefined);
    });
  });
});
