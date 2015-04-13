var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe(".forCluster", function() {
    it("should generate a hostname for the cluster", function() {
      var config = {
        appId: 12345,
        key: "1234567890abcdef",
        secret: "fedcba0987654321"
      };
      var pusher = Pusher.forCluster("test", config);
      expect(pusher.config.host).to.equal("api-test.pusher.com");
    });
  });
});
