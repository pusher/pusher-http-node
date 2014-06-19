var expect = require("expect.js");

var Pusher = require("../../lib/pusher");
var WebHook = require("../../lib/webhook");

describe("WebHook", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({
      appId: 10000,
      key: "123456789",
      secret: "beef"
    });
  });

  describe("#isValid", function() {
    it("should return true for a webhook with correct signature", function() {
      var webhook = new WebHook({
        headers: {
          "x-pusher-key": "123456789",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      }, pusher);
      expect(webhook.isValid()).to.be(true);
    });

    it("should return false for a webhook with incorrect key", function() {
      var webhook = new WebHook({
        headers: {
          "x-pusher-key": "000",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      }, pusher);
      expect(webhook.isValid()).to.be(false);
    });

    it("should return false for a webhook with incorrect signature", function() {
      var webhook = new WebHook({
        headers: {
          "x-pusher-key": "123456789",
          "x-pusher-signature": "000",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      }, pusher);
      expect(webhook.isValid()).to.be(false);
    });
  });

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
