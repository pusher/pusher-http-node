var expect = require("expect.js");
var nock = require("nock");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 10000, key: "aaaa", secret: "beef" });
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe("#post", function() {
    it("should set the correct path and include the body", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/10000/test?auth_key=aaaa&auth_timestamp=X&auth_version=1.0&body_md5=12bf5995ac4b1285a6d87b2dafb92590&auth_signature=Y",
          { foo: "one", bar: [1,2,3], baz: 4321 }
        )
        .reply(200, "{}");

      pusher.post({
        path: "/test",
        body: { foo: "one", bar: [1,2,3], baz: 4321 }
      }, done);
    });

    it("should set the request content type to application/json", function(done) {
      var mock = nock("http://api.pusherapp.com", {
          reqheaders: {
            "content-type": "application/json",
            "host": "api.pusherapp.com",
            "content-length": 2
          }
        })
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/10000/test?auth_key=aaaa&auth_timestamp=X&auth_version=1.0&body_md5=99914b932bd37a50b983c5e7c90ae93b&auth_signature=Y",
          {}
        )
        .reply(201, "{\"returned key\": 101010101}");

      pusher.post({ path: "/test", body: {} }, done);
    });

    it("should call back with the result", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/10000/test?auth_key=aaaa&auth_timestamp=X&auth_version=1.0&body_md5=99914b932bd37a50b983c5e7c90ae93b&auth_signature=Y",
          {}
        )
        .reply(201, "{\"returned key\": 101010101}");

      pusher.post({ path: "/test", body: {} }, function(error, request, response) {
        expect(error).to.be(null);
        expect(response.statusCode).to.equal(201);
        expect(response.body).to.equal("{\"returned key\": 101010101}");
        done();
      });
    });

    it("should respect the scheme, host and port config", function(done) {
      var pusher = new Pusher({
        appId: 10000,
        key: "aaaa",
        secret: "beef",
        scheme: "https",
        host: "example.com",
        port: 1234
      });
      var mock = nock("https://example.com:1234")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/10000/test?auth_key=aaaa&auth_timestamp=X&auth_version=1.0&body_md5=99914b932bd37a50b983c5e7c90ae93b&auth_signature=Y",
          {}
        )
        .reply(201, "{\"returned key\": 101010101}");

      pusher.post({ path: "/test", body: {} }, done);
    });
  });
});
