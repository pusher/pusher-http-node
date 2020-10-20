const expect = require("expect.js")

const Pusher = require("../../../lib/pusher")

describe("Pusher", function () {
  let pusher

  beforeEach(function () {
    pusher = new Pusher({ appId: 10000, key: "aaaa", secret: "tofu" })
  })

  describe("#auth", function () {
    it("should prefix the signature with the app key", function () {
      let pusher = new Pusher({ appId: 10000, key: "1234", secret: "tofu" })
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "1234:efa6cf7644a0b35cba36aa0f776f3cbf7bb60e95ea2696bde1dbe8403b61bd7c",
      })

      pusher = new Pusher({ appId: 10000, key: "abcdef", secret: "tofu" })
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "abcdef:efa6cf7644a0b35cba36aa0f776f3cbf7bb60e95ea2696bde1dbe8403b61bd7c",
      })
    })

    it("should return correct authentication signatures for different socket ids", function () {
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "aaaa:efa6cf7644a0b35cba36aa0f776f3cbf7bb60e95ea2696bde1dbe8403b61bd7c",
      })
      expect(pusher.authenticate("321.654", "test")).to.eql({
        auth:
          "aaaa:f6ecb0a17d3e4f68aca28f1673197a7608587c09deb0208faa4b5519aee0a777",
      })
    })

    it("should return correct authentication signatures for different channels", function () {
      expect(pusher.authenticate("123.456", "test1")).to.eql({
        auth:
          "aaaa:d5ab857f805433cb50562da96afa41688d7742a3c3a021ed15a4d991a4d8cf94",
      })
      expect(pusher.authenticate("123.456", "test2")).to.eql({
        auth:
          "aaaa:43affa6a09af1fb9ce1cadf176171346beaf7366673ec1e5920f68b3e97a466d",
      })
    })

    it("should return correct authentication signatures for different secrets", function () {
      let pusher = new Pusher({ appId: 10000, key: "11111", secret: "1" })
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "11111:584828bd6e80b2d177d2b28fde07b8e170abf87ccb5a791a50c933711fb8eb28",
      })
      pusher = new Pusher({ appId: 10000, key: "11111", secret: "2" })
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "11111:269bbf3f7625db4e0d0525b617efa5915c3ae667fd222dc8e4cb94bc531f26f2",
      })
    })

    it("should return the channel data", function () {
      expect(
        pusher.authenticate("123.456", "test", { foo: "bar" }).channel_data
      ).to.eql('{"foo":"bar"}')
    })

    it("should return correct authentication signatures with and without the channel data", function () {
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth:
          "aaaa:efa6cf7644a0b35cba36aa0f776f3cbf7bb60e95ea2696bde1dbe8403b61bd7c",
      })
      expect(pusher.authenticate("123.456", "test", { foo: "bar" })).to.eql({
        auth:
          "aaaa:f41faf9ead2ea76772cc6b1168363057459f02499ae4d92e88229dc7f4efa2d4",
        channel_data: '{"foo":"bar"}',
      })
    })

    it("should return correct authentication signature with utf-8 in channel data", function () {
      expect(pusher.authenticate("1.1", "test", "ą§¶™€łü€ß£")).to.eql({
        auth:
          "aaaa:2a229263e89d9c50524fd80c2e88be2843379f6931e28995e2cc214282c9db0c",
        channel_data: '"ą§¶™€łü€ß£"',
      })
    })

    it("should raise an exception if socket id is not a string", function () {
      expect(function () {
        pusher.authenticate(undefined, "test")
      }).to.throwException(/^Invalid socket id: 'undefined'$/)
      expect(function () {
        pusher.authenticate(null, "test")
      }).to.throwException(/^Invalid socket id: 'null'$/)
      expect(function () {
        pusher.authenticate(111, "test")
      }).to.throwException(/^Invalid socket id: '111'$/)
    })

    it("should raise an exception if socket id is an empty string", function () {
      expect(function () {
        pusher.authenticate("", "test")
      }).to.throwException(/^Invalid socket id: ''$/)
    })

    it("should raise an exception if socket id is invalid", function () {
      expect(function () {
        pusher.authenticate("1.1:", "test")
      }).to.throwException(/^Invalid socket id/)
      expect(function () {
        pusher.authenticate(":1.1", "test")
      }).to.throwException(/^Invalid socket id/)
      expect(function () {
        pusher.authenticate(":\n1.1", "test")
      }).to.throwException(/^Invalid socket id/)
      expect(function () {
        pusher.authenticate("1.1\n:", "test")
      }).to.throwException(/^Invalid socket id/)
    })

    it("should raise an exception if channel name is not a string", function () {
      expect(function () {
        pusher.authenticate("111.222", undefined)
      }).to.throwException(/^Invalid channel name: 'undefined'$/)
      expect(function () {
        pusher.authenticate("111.222", null)
      }).to.throwException(/^Invalid channel name: 'null'$/)
      expect(function () {
        pusher.authenticate("111.222", 111)
      }).to.throwException(/^Invalid channel name: '111'$/)
    })

    it("should raise an exception if channel name is an empty string", function () {
      expect(function () {
        pusher.authenticate("111.222", "")
      }).to.throwException(/^Invalid channel name: ''$/)
    })

    it("should throw an error for private-encrypted- channels", function () {
      expect(function () {
        pusher.authenticate("123.456", "private-encrypted-bla", "foo")
      }).to.throwException(
        "Cannot generate shared_secret because encryptionMasterKey is not set"
      )
    })
  })
})

describe("Pusher with encryptionMasterKey", function () {
  let pusher

  const testMasterKey = "01234567890123456789012345678901"

  beforeEach(function () {
    pusher = new Pusher({
      appId: 1234,
      key: "f00d",
      secret: "tofu",
      encryptionMasterKey: testMasterKey,
    })
  })

  describe("#auth", function () {
    it("should return a shared_secret for private-encrypted- channels", function () {
      expect(
        pusher.authenticate("123.456", "private-encrypted-bla", "foo")
      ).to.eql({
        auth:
          "f00d:962c48b78bf93d98ff4c92ee7dff04865821455b7b401e9d60a9e0a90af2c105",
        channel_data: '"foo"',
        shared_secret: "BYBsePpRCQkGPvbWu/5j8x+MmUF5sgPH5DmNBwkTzYs=",
      })
    })
    it("should not return a shared_secret for non-encrypted channels", function () {
      expect(pusher.authenticate("123.456", "bla", "foo")).to.eql({
        auth:
          "f00d:013ad3da0d88e0df6ae0a8184bef50b9c3933f2344499e6e3d1ad67fad799e20",
        channel_data: '"foo"',
      })
    })
  })
})
