var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher.forURL(process.env.PUSHER_URL);
  });

  describe("#triggerBatch", function() {
    it("should return code 200", function(done) {
      var events = [
        {
          channel: "integration",
          event_name: "event",
          data: "test"
          socket_id: null,
        }
      ];
      pusher.triggerBatch(events, function(error, request, response) {
        expect(error).to.be(null);
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(response.body)).to.eql({});
        done();
      });
    });
  });
});
