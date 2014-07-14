var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  describe("with keep-alive", function() {
    var pusher;

    beforeEach(function() {
      pusher = new Pusher.forURL(process.env.PUSHER_URL, {
        keepAlive: true
      });
    });

    it("should send 2 sequential requests successfully", function(done) {
      pusher.get({ path: "/channels" }, function(error, request, response) {
        expect(error).to.be(null);
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(response.body).channels).to.be.an(Object);
        pusher.get({ path: "/channels" }, function(error, request, response) {
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body).channels).to.be.an(Object);
          done();
        });
      });
    });
  });
});
