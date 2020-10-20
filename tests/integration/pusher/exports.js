const expect = require("expect.js")

const errors = require("../../../lib/errors")
const Pusher = require("../../../lib/pusher")
const Token = require("../../../lib/token")

describe("Pusher", function () {
  it("should export `Token`", function () {
    expect(Pusher.Token).to.be(Token)
  })

  it("should export `RequestError`", function () {
    expect(Pusher.RequestError).to.be(errors.RequestError)
  })

  it("should export `WebHookError`", function () {
    expect(Pusher.WebHookError).to.be(errors.WebHookError)
  })
})
