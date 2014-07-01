var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");
var WebHook = require("../../../lib/webhook");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 10000, key: "aaaa", secret: "beef" });
  });

  describe("#webhook", function() {
    it("should return a WebHook instance", function() {
      expect(pusher.webhook({ headers: {}, body: "" })).to.be.a(WebHook);
    });

    it("should pass the token to the WebHook", function() {
      expect(
        pusher.webhook({ headers: {}, body: "" }).token
      ).to.be(pusher.config.token);
    });
  });
});
