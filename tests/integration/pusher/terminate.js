const expect = require("expect.js")
const nock = require("nock")

const Pusher = require("../../../lib/pusher")
const sinon = require("sinon")

describe("Pusher", function () {
  let pusher

  beforeEach(function () {
    pusher = new Pusher({ appId: 1234, key: "f00d", secret: "tofu" })
    nock.disableNetConnect()
  })

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe("#terminateUserConnections", function () {
    it("should throw an error if user id is empty", function () {
      expect(function () {
        pusher.terminateUserConnections("")
      }).to.throwError(function (e) {
        expect(e).to.be.an(Error)
        expect(e.message).to.equal("Invalid user id: ''")
      })
    })

    it("should throw an error if user id is not a string", function () {
      expect(function () {
        pusher.terminateUserConnections(123)
      }).to.throwError(function (e) {
        expect(e).to.be.an(Error)
        expect(e.message).to.equal("Invalid user id: '123'")
      })
    })
  })

  it("should call /terminate_connections endpoint", function (done) {
    sinon.stub(pusher, "post")
    pusher.appId = 1234
    const userId = "testUserId"

    pusher.terminateUserConnections(userId)

    expect(pusher.post.called).to.be(true)
    expect(pusher.post.getCall(0).args[0]).eql({
      path: `/users/${userId}/terminate_connections`,
      body: {},
    })
    pusher.post.restore()
    done()
  })
})
