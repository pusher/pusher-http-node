var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  describe(".forCluster", function() {
    it("should generate a hostname for the cluster", function() {
      var pusher = Pusher.forCluster("test");
      expect(pusher.config.host).to.equal("api-test.pusher.com");
    });
  });
});
