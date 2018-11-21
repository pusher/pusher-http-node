var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 10000, key: "aaaa", secret: "beef" });
  });

  describe("#auth", function() {
    it("should prefix the signature with the app key", function() {
      var pusher = new Pusher({ appId: 10000, key: "1234", secret: "beef" });
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "1234:d16bec9b73b4b3b9186bc5ce87daddc14e6afa714f663fd35839f94be1707ea3"
      });

      pusher = new Pusher({ appId: 10000, key: "abcdef", secret: "beef" });
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "abcdef:d16bec9b73b4b3b9186bc5ce87daddc14e6afa714f663fd35839f94be1707ea3"
      });
    });

    it("should return correct authentication signatures for different socket ids", function() {
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "aaaa:d16bec9b73b4b3b9186bc5ce87daddc14e6afa714f663fd35839f94be1707ea3"
      });
      expect(pusher.authenticate("321.654", "test")).to.eql({
        auth: "aaaa:69858dbfae85099306caa764f698d4e29970d93baa746a6df6788c92c0ec4409"
      });
    });

    it("should return correct authentication signatures for different channels", function() {
      expect(pusher.authenticate("123.456", "test1")).to.eql({
        auth: "aaaa:2e8533af473c22fbf5456375ace186413bcdd64513edefc60657d7327c1a43af"
      });
      expect(pusher.authenticate("123.456", "test2")).to.eql({
        auth: "aaaa:c26e4dce5ab543b2deac513708ea03e91aac2cd1caa4cdd261fc7739ba09cfbe"
      });
    });

    it("should return correct authentication signatures for different secrets", function() {
      var pusher = new Pusher({ appId: 10000, key: "11111", secret: "1" });
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "11111:584828bd6e80b2d177d2b28fde07b8e170abf87ccb5a791a50c933711fb8eb28"
      });
      pusher = new Pusher({ appId: 10000, key: "11111", secret: "2" });
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "11111:269bbf3f7625db4e0d0525b617efa5915c3ae667fd222dc8e4cb94bc531f26f2"
      });
    });

    it("should return the channel data", function() {
      expect(pusher.authenticate("123.456", "test", { foo: "bar" }).channel_data).to.eql(
        "{\"foo\":\"bar\"}"
      );
    });

    it("should return correct authentication signatures with and without the channel data", function() {
      expect(pusher.authenticate("123.456", "test")).to.eql({
        auth: "aaaa:d16bec9b73b4b3b9186bc5ce87daddc14e6afa714f663fd35839f94be1707ea3"
      });
      expect(pusher.authenticate("123.456", "test", { foo: "bar" })).to.eql({
        auth: "aaaa:4ec8fab54df3950d32d95a579e46b53060ea3579bc678842a80b7c530f90d439",
        channel_data: "{\"foo\":\"bar\"}"
      });
    });

    it("should return correct authentication signature with utf-8 in channel data", function() {
      expect(pusher.authenticate("1.1", "test", "ą§¶™€łü€ß£")).to.eql({
        auth: "aaaa:0d392e309f194ebfd063409e2a35d1e5f0fb0148e6ff5e9e92233816a70f2a12",
        channel_data: "\"ą§¶™€łü€ß£\""
      });
    });

    it("should raise an exception if socket id is not a string", function() {
      expect(function() {
        pusher.authenticate(undefined, "test")
      }).to.throwException(/^Invalid socket id: 'undefined'$/);
      expect(function() {
        pusher.authenticate(null, "test")
      }).to.throwException(/^Invalid socket id: 'null'$/);
      expect(function() {
        pusher.authenticate(111, "test")
      }).to.throwException(/^Invalid socket id: '111'$/);
    });

    it("should raise an exception if socket id is an empty string", function() {
      expect(function() {
        pusher.authenticate("", "test")
      }).to.throwException(/^Invalid socket id: ''$/);
    });

    it("should raise an exception if socket id is invalid", function() {
      expect(function() {
        pusher.authenticate("1.1:", "test")
      }).to.throwException(/^Invalid socket id/);
      expect(function() {
        pusher.authenticate(":1.1", "test")
      }).to.throwException(/^Invalid socket id/);
      expect(function() {
        pusher.authenticate(":\n1.1", "test")
      }).to.throwException(/^Invalid socket id/);
      expect(function() {
        pusher.authenticate("1.1\n:", "test")
      }).to.throwException(/^Invalid socket id/);
    });

    it("should raise an exception if channel name is not a string", function() {
      expect(function() {
        pusher.authenticate("111.222", undefined)
      }).to.throwException(/^Invalid channel name: 'undefined'$/);
      expect(function() {
        pusher.authenticate("111.222", null)
      }).to.throwException(/^Invalid channel name: 'null'$/);
      expect(function() {
        pusher.authenticate("111.222", 111)
      }).to.throwException(/^Invalid channel name: '111'$/);
    });

    it("should raise an exception if channel name is an empty string", function() {
      expect(function() {
        pusher.authenticate("111.222", "")
      }).to.throwException(/^Invalid channel name: ''$/);
    });

    it("should throw an error for private-encrypted- channels", function() {
      expect(function() {
        pusher.authenticate("123.456", "private-encrypted-bla", "foo");
      }).to.throwException('Cannot generate shared_secret because encryptionMasterKey is not set');
    });
  });
});

describe("Pusher with encryptionMasterKey", function() {
  var pusher;

  var testMasterKey = "01234567890123456789012345678901";

  beforeEach(function() {
    pusher = new Pusher({ appId: 1234, key: "f00d", secret: "beef", encryptionMasterKey: testMasterKey });
  });

  describe("#auth", function() {
    it("should return a shared_secret for private-encrypted- channels", function() {
      expect(pusher.authenticate("123.456", "private-encrypted-bla", "foo")).to.eql({
        auth: "f00d:d8df1e524cf38fbde4f1dc38e6eaa4943e60412122801eed1f0e89c8a1268784",
        channel_data: "\"foo\"",
        shared_secret: "BYBsePpRCQkGPvbWu/5j8x+MmUF5sgPH5DmNBwkTzYs="
      });
    });
    it("should not return a shared_secret for non-encrypted channels", function() {
      expect(pusher.authenticate("123.456", "bla", "foo")).to.eql({
        auth: "f00d:4c48fa1cb34537501eb3291b28c0b04de270008ae418bc3141f4f11680abe312",
        channel_data: "\"foo\"",
      });
    });
  });
});
