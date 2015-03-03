var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher.forURL(process.env.PUSHER_URL);
  });

  describe("#trigger", function() {
    
    it("should return a result", function(done) {
      pusher.trigger("integration", "event", "test", null, function(error, result) {
        expect(error).to.be(null);
        expect(result).to.be.ok();
        done();
      });
    });
    
    it("should expose the event_id of a event triggered on a single channel", function(done) {
      pusher.trigger("integration", "event", "test", null, function(error, result) {
        expect(error).to.be(null);
        expect(result.event_ids['integration']).to.be.ok();
        done();
      });
    });
    
    it("should expose the event_id of a events triggered on multiple channels", function(done) {
      pusher.trigger(['ch1', 'ch2', 'ch3'], "event", "test", null, function(error, result) {
        expect(error).to.be(null);
        expect(result.event_ids['ch1']).to.be.ok();
        expect(result.event_ids['ch2']).to.be.ok();
        expect(result.event_ids['ch3']).to.be.ok();
        done();
      });
    });
    
  });
});
