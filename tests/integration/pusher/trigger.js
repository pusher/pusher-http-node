var expect = require("expect.js");
var fs = require('fs');

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  var config = JSON.parse(fs.readFileSync(__dirname + '/../../config.json'));
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({
      appId: config.pusher.id,
      key: config.pusher.key,
      secret: config.pusher.secret
    });
  });

  describe("#trigger", function() {
    describe("over HTTP", function() {
      it("should return code 200", function(done) {
        pusher.trigger("integration", "event", "test", null, function(error, request, response) {
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body)).to.eql({});
          done();
        });
      });
    });

    describe("over HTTPS", function() {
      xit("should return code 200");
    });
  });
});
