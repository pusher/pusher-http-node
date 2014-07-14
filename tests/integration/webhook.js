var expect = require("expect.js");

var Pusher = require("../../lib/pusher");
var Token = require("../../lib/token");
var WebHook = require("../../lib/webhook");

describe("WebHook", function() {
  var token;

  beforeEach(function() {
    token = new Token("123456789", "beef");
  });

  describe("#isValid", function() {
    it("should return true for a webhook with correct signature", function() {
      var webhook = new WebHook(token, {
        headers: {
          "x-pusher-key": "123456789",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      });
      expect(webhook.isValid()).to.be(true);
    });

    it("should return false for a webhook with incorrect key", function() {
      var webhook = new WebHook(token, {
        headers: {
          "x-pusher-key": "000",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      });
      expect(webhook.isValid()).to.be(false);
    });

    it("should return false for a webhook with incorrect signature", function() {
      var webhook = new WebHook(token, {
        headers: {
          "x-pusher-key": "123456789",
          "x-pusher-signature": "000",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      });
      expect(webhook.isValid()).to.be(false);
    });

    it("should return true if webhook is signed with the extra token", function() {
      var webhook = new WebHook(token, {
        headers: {
          "x-pusher-key": "1234",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      });
      expect(webhook.isValid(new Token("1234", "beef"))).to.be(true);
    });

    it("should return true if webhook is signed with one of the extra tokens", function() {
      var webhook = new WebHook(token, {
        headers: {
          "x-pusher-key": "3",
          "x-pusher-signature": "df1465f5ff93f83238152fd002cb904f9562d39569e68f00a6bfa0d8ccf88334",
          "content-type": "application/json"
        },
        rawBody: JSON.stringify({
          time_ms: 1403175510755,
          events: [{ channel: "test_channel", name: "channel_vacated" }]
        })
      });
      expect(
        webhook.isValid(
          [ new Token("1", "nope"),
            new Token("2", "not really"),
            new Token("3", "beef")
          ]
        )
      ).to.be(true);
    });
  });

  describe("#isContentTypeValid", function() {
    it("should return true if content type is `application/json`", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/json",
        },
        rawBody: JSON.stringify({})
      });
      expect(webhook.isContentTypeValid()).to.be(true);
    });

    it("should return false if content type is not `application/json`", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/weird",
        },
        rawBody: JSON.stringify({})
      });
      expect(webhook.isContentTypeValid()).to.be(false);
    });
  });

  describe("#isBodyValid", function() {
    it("should return true if content type is `application/json` and body is valid JSON", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/json",
        },
        rawBody: JSON.stringify({})
      });
      expect(webhook.isBodyValid()).to.be(true);
    });

    it("should return false if content type is `application/json` and body is not valid JSON", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/json",
        },
        rawBody: "not json!"
      });
      expect(webhook.isBodyValid()).to.be(false);
    });

    it("should return false if content type is not `application/json`", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/weird",
        },
        rawBody: JSON.stringify({})
      });
      expect(webhook.isContentTypeValid()).to.be(false);
    });
  });

  describe("#getData", function() {
    it("should return a parsed JSON body", function() {
      var webhook = new WebHook(token, {
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({foo: 9})
      });
      expect(webhook.getData()).to.eql({ foo: 9 });
    });

    it("should throw an error if content type is not `application/json`", function() {
      var body = JSON.stringify({foo: 9});
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/weird",
          "x-pusher-signature": "f000000"
        },
        rawBody: body
      });
      expect(function() {
        webhook.getData();
      }).to.throwError(function(e) {
        expect(e).to.be.a(Pusher.WebHookError);
        expect(e.message).to.equal("Invalid WebHook body");
        expect(e.contentType).to.equal("application/weird");
        expect(e.body).to.equal(body);
        expect(e.signature).to.equal("f000000");
      });
    });

    it("should throw an error if body is not valid JSON", function() {
      var webhook = new WebHook(token, {
        headers: {
          "content-type": "application/json",
          "x-pusher-signature": "b00"
       },
        rawBody: "not json"
      });
      expect(function() {
        webhook.getData();
      }).to.throwError(function(e) {
        expect(e).to.be.a(Pusher.WebHookError);
        expect(e.contentType).to.equal("application/json");
        expect(e.body).to.equal("not json");
        expect(e.signature).to.equal("b00");
      });
    });
  });

  describe("#getTime", function() {
    it("should return a correct date object", function() {
      var webhook = new WebHook(token, {
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({time_ms: 1403172023361})
      });
      expect(webhook.getTime()).to.eql(new Date(1403172023361));
    });
  });

  describe("#getEvents", function() {
    it("should return an array of events", function() {
      var webhook = new WebHook(token, {
        headers: { "content-type": "application/json" },
        rawBody: JSON.stringify({
          events: [1, 2, 3]
        })
      });
      expect(webhook.getEvents()).to.eql([1, 2, 3]);
    });
  });
});
