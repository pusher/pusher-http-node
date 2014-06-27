var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher.forURL(process.env.PUSHER_URL);
  });

  describe("#get", function() {
    describe("/channels", function() {
      it("should return channels as an object", function(done) {
        pusher.get({ path: "/channels" }, function(error, request, response) {
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body).channels).to.be.an(Object);
          done();
        });
      });
    });

    describe("/channels/CHANNEL", function() {
      it("should return if the channel is occupied", function(done) {
        pusher.get({ path: "/channels/CHANNEL" }, function(error, request, response) {
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body).occupied).to.be.a("boolean");
          done();
        });
      });
    });

    describe("/channels/CHANNEL/users", function() {
      it("should return code 400 for non-presence channels", function(done) {
        pusher.get({ path: "/channels/CHANNEL/users" }, function(error, request, response) {
          expect(error).to.be.a(Pusher.RequestError);
          expect(error.message).to.equal("Unexpected status code 400");
          expect(error.statusCode).to.equal(400);
          done();
        });
      });
    });
  });
});
