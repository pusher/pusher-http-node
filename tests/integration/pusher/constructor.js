var expect = require("expect.js");

var Pusher = require("../../../lib/pusher");

var validAppId = 12345;
var validKey = "1234567890abcdef";
var validSecret = "fedcba0987654321";
var validCredentials = {
  appId: 12345,
  key: validKey,
  secret: validSecret
};

function cloneConfig() {
  var config = {};
  for(var x in validCredentials) {
    config[x] = validCredentials[x];
  }
  return config;
}

describe("Pusher", function() {
  describe("constructor attributes", function() {
    it("should support `appId`", function() {
      var pusher = new Pusher({ appId: 12345 });
      expect(pusher.config.appId).to.equal(12345);
    });
    
    it("should require `appId` to be an Integer", function() {
      expect(function() {
        new Pusher({ appId: "fish" });
      }).to.throwError();
    });
    
    it("should not allow `appId` to be null", function() {
      expect(function() {
        new Pusher({ appId: null });
      }).to.throwError();
    });
    
    it("should not allow `appId` to be undefined", function() {
      expect(function() {
        new Pusher({ appId: undefined });
      }).to.throwError();
    });

    it("should support `token`", function() {
      var config = cloneConfig();
      var pusher = new Pusher(config);
      expect(pusher.config.token.key).to.equal("1234567890abcdef");
      expect(pusher.config.token.secret).to.equal("fedcba0987654321");
    });

    it("should default `encrypted` to false", function() {
      var pusher = new Pusher(validCredentials);
      expect(pusher.config.scheme).to.equal("http");
    });

    it("should support `encrypted`", function() {
      var config = cloneConfig();
      config.encrypted = true;
      var pusher = new Pusher(config);
      expect(pusher.config.scheme).to.equal("https");
    });

    it("should default `host` to 'api.pusherapp.com'", function() {
      var pusher = new Pusher(validCredentials);
      expect(pusher.config.host).to.equal("api.pusherapp.com");
    });

    it("should support `host`", function() {
      var config = cloneConfig();
      config.host = "example.org";
      var pusher = new Pusher(config);
      expect(pusher.config.host).to.equal("example.org");
    });

    it("should default `port` to undefined", function() {
      var config = cloneConfig();
      config.encrypted = true; 
      var pusher = new Pusher(config);
      expect(pusher.config.port).to.be(undefined);
    });

    it("should support `port`", function() {
      var config = cloneConfig();
      config.port = 8080;
      var pusher = new Pusher(config);
      expect(pusher.config.port).to.equal(8080);
      
      var config2 = cloneConfig();
      config.encrypted = true;
      config.port = 8080;

      pusher = new Pusher(config);
      expect(pusher.config.port).to.equal(8080);
    });

    it("should default `proxy` to `undefined`", function() {
      var pusher = new Pusher(validCredentials);
      expect(pusher.config.proxy).to.be(undefined);
    });

    it("should support `proxy`", function() {
      var config = cloneConfig();
      config.proxy = "https://test:tset@example.com";
      var pusher = new Pusher(config);
      expect(pusher.config.proxy).to.equal("https://test:tset@example.com");
    });

    it("should default `timeout` to `undefined`", function() {
      var pusher = new Pusher(validCredentials);
      expect(pusher.config.timeout).to.be(undefined);
    });

    it("should support `timeout`", function() {
      var config = cloneConfig();
      config.timeout = 1001;
      var pusher = new Pusher(config);
      expect(pusher.config.timeout).to.equal(1001);
    });
  });
});
