var expect = require("expect.js");

var Pusher = require("../../lib/pusher");
var WebHook = require("../../lib/webhook");

describe("WebHook", function() {
  var pusher;

  describe("#getData", function() {
    it("should return a parsed JSON body", function() {
      var webhook = new WebHook({
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({foo: 9})
      });
      expect(webhook.getData()).to.eql({ foo: 9 });
    });

    it("should throw an error if content type is not `application/json`", function() {
      var webhook = new WebHook({
        headers: { "content-type": "application/weird" },
        rawBody: JSON.stringify({foo: 9})
      });
      expect(function() {
        webhook.getData();
      }).to.throwError();
    });

    it("should throw an error if body is not valid JSON", function() {
      var webhook = new WebHook({
        headers: { "content-type": "application/json" },
        rawBody: "not json"
      });
      expect(function() {
        webhook.getData();
      }).to.throwError();
    });
  });

  describe("#getTime", function() {
    it("should return a correct date object", function() {
      var webhook = new WebHook({
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({time_ms: 1403172023361})
      });
      expect(webhook.getTime()).to.eql(new Date(1403172023361));
    });
  });

  describe("#getEvents", function() {
    it("should return an array of events", function() {
      var webhook = new WebHook({
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({
          events: [1, 2, 3]
        })
      });
      expect(webhook.getEvents()).to.eql([1, 2, 3]);
    });
  });
});
