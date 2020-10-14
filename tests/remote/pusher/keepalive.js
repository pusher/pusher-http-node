var https = require("https")

var expect = require("expect.js")

var Pusher = require("../../../lib/pusher")

describe("Pusher (integration)", function () {
  describe("with keep-alive", function () {
    var pusher

    beforeEach(function () {
      pusher = new Pusher.forURL(process.env.PUSHER_URL, {
        agent: new https.Agent({ keepAlive: true }),
      })
    })

    // TODO this test is useless. It passes if keepAlive is false...
    it("should send 2 sequential requests successfully", function (done) {
      pusher
        .get({ path: "/channels" })
        .then(response => {
          expect(response.status).to.equal(200)
          return response.json()
        })
        .then(body => {
          expect(body.channels).to.be.an(Object)
          return pusher.get({ path: "/channels" })
        })
        .then(response => {
          expect(response.status).to.equal(200)
          return response.json()
        })
        .then(body => {
          expect(body.channels).to.be.an(Object)
          done()
        })
        .catch(done)
    })
  })
})
