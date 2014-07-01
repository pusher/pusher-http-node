var expect = require("expect.js");
var http_proxy = require("../../helpers/http_proxy");

var Pusher = require("../../../lib/pusher");

describe("Pusher (integration)", function() {
  describe("with configured proxy", function() {
    var pusher;
    var proxy;

    before(function(done) {
      proxy = http_proxy.start(done);
    });

    beforeEach(function() {
      pusher = new Pusher.forURL(process.env.PUSHER_URL, {
        proxy: "http://localhost:8321"
      });
    });

    afterEach(function() {
      proxy.requests = 0;
    });

    after(function(done) {
      http_proxy.stop(proxy, done);
    });

    describe("#get", function() {
      it("should go through the proxy", function(done) {
        expect(proxy.requests).to.equal(0);
        pusher.get({ path: "/channels" }, function(error, request, response) {
          expect(proxy.requests).to.equal(1);
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body).channels).to.be.an(Object);
          done();
        });
      });
    });

    describe("#trigger", function() {
      it("should go through the proxy", function(done) {
        expect(proxy.requests).to.equal(0);
        pusher.trigger("integration", "event", "test", null, function(error, request, response) {
          expect(proxy.requests).to.equal(1);
          expect(error).to.be(null);
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body)).to.eql({});
          done();
        });
      });
    });
  });
});
