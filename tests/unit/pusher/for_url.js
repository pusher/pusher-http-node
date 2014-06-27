var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe(".forUrl", function() {
    it("should set `appId`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.appId).to.equal(4321);
    });

    it("should set `token`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.token.key).to.equal("123abc");
      expect(pusher.token.secret).to.equal("def456");
    });

    it("should set `scheme`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.scheme).to.equal("https");
    });

    it("should set `host`", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.host).to.equal("example.org");
    });

    it("should set `port` to 80 for http if not specified", function() {
      var pusher = Pusher.forURL("http://123abc:def456@example.org/apps/4321");
      expect(pusher.port).to.equal(80);
    });

    it("should set `port` to 443 for http if not specified", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org/apps/4321");
      expect(pusher.port).to.equal(443);
    });

    it("should set `port` if specified", function() {
      var pusher = Pusher.forURL("https://123abc:def456@example.org:999/apps/4321");
      expect(pusher.port).to.equal(999);
    });
  });
});
