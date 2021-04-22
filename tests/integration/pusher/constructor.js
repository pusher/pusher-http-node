const expect = require("expect.js")
const HttpsProxyAgent = require("https-proxy-agent")

const Pusher = require("../../../lib/pusher")

describe("Pusher", function () {
  describe("constructor attributes", function () {
    it("should support `appId`", function () {
      const pusher = new Pusher({ appId: 12345 })
      expect(pusher.config.appId).to.equal(12345)
    })

    it("should support `token`", function () {
      const pusher = new Pusher({
        key: "1234567890abcdef",
        secret: "fedcba0987654321",
      })
      expect(pusher.config.token.key).to.equal("1234567890abcdef")
      expect(pusher.config.token.secret).to.equal("fedcba0987654321")
    })

    it("should default `useTLS` to false", function () {
      const pusher = new Pusher({})
      expect(pusher.config.scheme).to.equal("http")
    })

    it("should support `useTLS`", function () {
      const pusher = new Pusher({ useTLS: true })
      expect(pusher.config.scheme).to.equal("https")
    })

    it("should support deprecated `encrypted`", function () {
      const pusher = new Pusher({ encrypted: true })
      expect(pusher.config.scheme).to.equal("https")
    })

    it("should throw an exception if `useTLS` and `encrypted` are set", function () {
      expect(function () {
        new Pusher({ useTLS: true, encrypted: false })
      }).to.throwException(
        /^Cannot set both `useTLS` and `encrypted` configuration options$/
      )
    })

    it("should default `host` to 'api.pusherapp.com'", function () {
      const pusher = new Pusher({})
      expect(pusher.config.host).to.equal("api.pusherapp.com")
    })

    it("should support `host`", function () {
      const pusher = new Pusher({ host: "example.org" })
      expect(pusher.config.host).to.equal("example.org")
    })

    it("should support `cluster`", function () {
      const pusher = new Pusher({ cluster: "eu" })
      expect(pusher.config.host).to.equal("api-eu.pusher.com")
    })

    it("should have `host` override `cluster`", function () {
      const pusher = new Pusher({
        host: "api.staging.pusher.com",
        cluster: "eu",
      })
      expect(pusher.config.host).to.equal("api.staging.pusher.com")
    })

    it("should default `port` to undefined", function () {
      const pusher = new Pusher({ useTLS: true })
      expect(pusher.config.port).to.be(undefined)
    })

    it("should support `port`", function () {
      let pusher = new Pusher({ port: 8080 })
      expect(pusher.config.port).to.equal(8080)

      pusher = new Pusher({ useTLS: true, port: 8080 })
      expect(pusher.config.port).to.equal(8080)
    })

    it("should default `agent` to `undefined`", function () {
      const pusher = new Pusher({})
      expect(pusher.config.agent).to.be(undefined)
    })

    it("should support `agent`", function () {
      const agent = new HttpsProxyAgent("https://test:tset@example.com")
      const pusher = new Pusher({ agent })
      expect(pusher.config.agent).to.equal(agent)
    })

    it("should default `timeout` to `undefined`", function () {
      const pusher = new Pusher({})
      expect(pusher.config.timeout).to.be(undefined)
    })

    it("should support `timeout`", function () {
      const pusher = new Pusher({ timeout: 1001 })
      expect(pusher.config.timeout).to.equal(1001)
    })

    it("should support `encryptionMasterKey` of 32 bytes", function () {
      const key = "01234567890123456789012345678901"
      const pusher = new Pusher({ encryptionMasterKey: key })
      expect(pusher.config.encryptionMasterKey.toString()).to.equal(key)
    })

    it("should reject `encryptionMasterKey` of 31 bytes", function () {
      const key = "0123456789012345678901234567890"
      expect(function () {
        new Pusher({ encryptionMasterKey: key })
      }).to.throwException(/31 bytes/)
    })

    it("should reject `encryptionMasterKey` of 33 bytes", function () {
      const key = "012345678901234567890123456789012"
      expect(function () {
        new Pusher({ encryptionMasterKey: key })
      }).to.throwException(/33 bytes/)
    })

    it("should support `encryptionMasterKeyBase64` which decodes to 32 bytes", function () {
      const key = "01234567890123456789012345678901"
      const keyBase64 = Buffer.from(key).toString("base64")
      const pusher = new Pusher({ encryptionMasterKeyBase64: keyBase64 })
      expect(pusher.config.encryptionMasterKey.toString()).to.equal(key)
    })

    it("should reject `encryptionMasterKeyBase64` which decodes to 31 bytes", function () {
      const key = "0123456789012345678901234567890"
      const keyBase64 = Buffer.from(key).toString("base64")
      expect(function () {
        new Pusher({ encryptionMasterKeyBase64: keyBase64 })
      }).to.throwException(/31 bytes/)
    })

    it("should reject `encryptionMasterKeyBase64` which decodes to 33 bytes", function () {
      const key = "012345678901234567890123456789012"
      const keyBase64 = Buffer.from(key).toString("base64")
      expect(function () {
        new Pusher({ encryptionMasterKeyBase64: keyBase64 })
      }).to.throwException(/33 bytes/)
    })

    it("should reject `encryptionMasterKeyBase64` which is invalid base64", function () {
      const keyBase64 = "aGkgd(GhlcmUK"
      expect(function () {
        new Pusher({ encryptionMasterKeyBase64: keyBase64 })
      }).to.throwException(/valid base64/)
    })
  })
})
