var expect = require("expect.js");
var sinon = require("sinon");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 1234, key: "f00d", secret: "beef" });
  });

  describe("#createSignedQueryString", function() {
    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers(1234567890000, "Date");
    });

    afterEach(function() {
      clock.restore();
    });

    describe("when signing a body", function() {
      it("should set the auth_key param to the app key", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          body: "example body"
        });
        expect(queryString).to.match(/^(.*&)?auth_key=f00d(&.*)?$/);
      });

      it("should set the auth_timestamp param to the current timestamp (in seconds)", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          body: "example body"
        });
        // Date.now is mocked
        expect(queryString).to.match(/^(.*&)?auth_timestamp=1234567890(&.*)?$/);
      });

      it("should set the auth_version param to 1.0", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          body: "example body"
        });
        expect(queryString).to.match(/^(.*&)?auth_version=1\.0(&.*)?$/);
      });

      it("should set the body_md5 param to a correct hash", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          body: "example body"
        });
        expect(queryString).to.match(/^(.*&)?body_md5=165d5e6d7ca8f73b3853ce45addf42fc(&.*)?$/);
      });

      it("should set the auth_signature to a correct hash", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          body: "example body"
        });
        // Date.now is mocked, so the signature can be hardcoded
        expect(queryString).to.match(/^(.*&)?auth_signature=89323a7f200fdefaa992e73e0953534dbb94c4dd2450514bcb4721b28b14fb26(&.*)?$/);
      });
    });

    describe("when signing params", function() {
      it("should set the auth_key param to the app key", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          params: { foo: "bar" }
        });
        expect(queryString).to.match(/^(.*&)?auth_key=f00d(&.*)?$/);
      });

      it("should set the auth_timestamp param to the current timestamp (in seconds)", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          params: { foo: "bar" }
        });
        // Date.now is mocked
        expect(queryString).to.match(/^(.*&)?auth_timestamp=1234567890(&.*)?$/);
      });

      it("should set the auth_version param to 1.0", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          params: { foo: "bar" }
        });
        expect(queryString).to.match(/^(.*&)?auth_version=1\.0(&.*)?$/);
      });

      it("should set all given params", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          params: { foo: "bar", baz: 123454321 }
        });
        expect(queryString).to.match(/^(.*&)?foo=bar(&.*)?$/);
        expect(queryString).to.match(/^(.*&)?baz=123454321(&.*)?$/);
      });

      it("should set the auth_signature to a correct hash", function() {
        var queryString = pusher.createSignedQueryString({
          method: "GET",
          path: "/event",
          params: { foo: "bar", baz: 123454321 }
        });
        // Date.now is mocked, so the signature can be hardcoded
          expect(queryString).to.match(/^(.*&)?auth_signature=3dd3a21ed3ae81a7ef9733e520ea3c0d8e9973b2eae979ad4efab821933798ab(&.*)?$/);
      });

      it("should raise an expcetion when overriding the auth_key param", function() {
        expect(function() {
          pusher.createSignedQueryString({
            method: "GET",
            path: "/event",
            params: { auth_key: "NOPE" }
          });
        }).to.throwException(/^auth_key is a required parameter and cannot be overidden$/);
      });

      it("should raise an expcetion when overriding the auth_timestamp param", function() {
        expect(function() {
          pusher.createSignedQueryString({
            method: "GET",
            path: "/event",
            params: { auth_timestamp: "NOPE" }
          });
        }).to.throwException(/^auth_timestamp is a required parameter and cannot be overidden$/);
      });

      it("should raise an expcetion when overriding the auth_version param", function() {
        expect(function() {
          pusher.createSignedQueryString({
            method: "GET",
            path: "/event",
            params: { auth_version: "NOPE" }
          });
        }).to.throwException(/^auth_version is a required parameter and cannot be overidden$/);
      });

      it("should raise an expcetion when overriding the auth_signature param", function() {
        expect(function() {
          pusher.createSignedQueryString({
            method: "GET",
            path: "/event",
            params: { auth_signature: "NOPE" }
          });
        }).to.throwException(/^auth_signature is a required parameter and cannot be overidden$/);
      });
    });
  });
});
