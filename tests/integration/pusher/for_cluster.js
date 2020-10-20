const expect = require("expect.js")

const Pusher = require("../../../lib/pusher")

describe("Pusher", function () {
  describe(".forCluster", function () {
    it("should generate a hostname for the cluster", function () {
      const pusher = Pusher.forCluster("test")
      expect(pusher.config.host).to.equal("api-test.pusher.com")
    })

    it("should override the hostname if set in the extra options", function () {
      const pusher = Pusher.forCluster("eu", {
        host: "api.staging.pusher.com",
      })
      expect(pusher.config.host).to.equal("api-eu.pusher.com")
    })

    it("should use the cluster option passed as first param not the option", function () {
      const pusher = Pusher.forCluster("eu", {
        cluster: "mt1",
      })
      expect(pusher.config.host).to.equal("api-eu.pusher.com")
    })
  })
})
