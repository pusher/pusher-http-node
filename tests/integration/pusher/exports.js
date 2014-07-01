var expect = require("expect.js");

var errors = require("../../../lib/errors");
var Pusher = require("../../../lib/pusher");
var Token = require("../../../lib/token");

describe("Pusher", function() {
  it("should export `Token`", function() {
    expect(Pusher.Token).to.be(Token);
  });

  it("should export `RequestError`", function() {
    expect(Pusher.RequestError).to.be(errors.RequestError);
  });

  it("should export `WebHookError`", function() {
    expect(Pusher.WebHookError).to.be(errors.WebHookError);
  });
});
