var expect = require("expect.js");
var nock = require("nock");

var Pusher = require("../../../lib/pusher");

describe("Pusher", function() {
  var pusher;

  beforeEach(function() {
    pusher = new Pusher({ appId: 1234, key: "f00d", secret: "beef" });
    nock.disableNetConnect();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe("#trigger", function() {
    it("should send the event when no callback is given", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "});
      setTimeout(function() {
        // we have no callback in this test, so we wait until the next tick
        expect(mock.isDone()).to.be(true);
        done();
      }, 0);
    });

    it("should send the event to a single channel", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=e95168baf497b2e54b2c6cadd41a6a3f&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["one"] }
        )
        .reply(200, "{}");

      pusher.trigger("one", "my_event", { some: "data "}, done);
    });

    it("should send the event to multiple channels", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=530dac0aa045e5f8e51c470aed0ce325&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["one", "two", "three"] }
        )
        .reply(200, "{}");

      pusher.trigger(["one", "two", "three"], "my_event", { some: "data "}, done);
    });

    it("should serialize arrays into JSON", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=18e64b2fed38726915d79ebb4f8feb5b&auth_signature=Y",
          { name: "my_event", data: "[1,2,4]", channels: ["one"] }
        )
        .reply(200, "{}");

      pusher.trigger("one", "my_event", [1,2,4], done);
    });

    it("should not serialize strings into JSON", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=f358a562d00e1bfe1859132d932cd706&auth_signature=Y",
          { name: "test_event", data: "test string", channels: ["test"] }
        )
        .reply(200, "{}");

      pusher.trigger("test", "test_event", "test string", done);
    });

    it("should add socket_id to the request body", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", done);
    });

    it("should call back with the result", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
        )
        .reply(200, "OK");

      pusher.trigger("test_channel", "my_event", { some: "data "}, function(error, request, response) {
        expect(error).to.be(null);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should call back with a RequestError if Pusher responds with 4xx", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
        )
        .reply(400, "Error");

      pusher.trigger("test_channel", "my_event", { some: "data "}, function(error, request, response) {
        expect(error).to.be.a(Pusher.RequestError);
        expect(error.message).to.equal("Unexpected status code 400");
        expect(error.url).to.match(
          /^http:\/\/api.pusherapp.com\/apps\/1234\/events\?auth_key=f00d&auth_timestamp=[0-9]+&auth_version=1\.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=[a-f0-9]+$/
        );
        expect(error.statusCode).to.equal(400);
        expect(error.body).to.equal("Error");
        done();
      });
    });

    it("should allow channel names with special characters: _ - = @ , . ;", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=024f0f297e27e131c8ec2c8817d153f4&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_-=@,.;channel"] }
        )
        .reply(200, "OK");

      pusher.trigger("test_-=@,.;channel", "my_event", { some: "data "}, function(error, request, response) {
        expect(error).to.be(null);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("should throw an error if called with more than 10 channels", function() {
      expect(function() {
        pusher.trigger(
          ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"], "x", {}
        );
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal(
          "Can't trigger a message to more than 10 channels"
        );
      });
    });

    it("should throw an error if channel name is empty", function() {
      expect(function() {
        pusher.trigger("", "test");
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal("Invalid channel name: ''");
      });
    });

    it("should throw an error if channel name is invalid", function() {
      expect(function() {
        pusher.trigger("abc$", "test");
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal("Invalid channel name: 'abc$'");
      });
    });

    it("should throw an error if channel name is longer than 200 characters", function() {
      var channel = new Array(202).join("x"); // 201 characters
      expect(function() {
        pusher.trigger(channel, "test");
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal("Channel name too long: '" + channel + "'");
      });
    });

    it("should throw an error if event name is longer than 200 characters", function() {
      var event = new Array(202).join("x"); // 201 characters
      expect(function() {
        pusher.trigger("test", event);
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal("Too long event name: '" + event + "'");
      });
    });

    it("should respect the encryption, host and port config", function(done) {
      var pusher = new Pusher({
        appId: 1234,
        key: "f00d",
        secret: "beef",
        encrypted: true,
        host: "example.com",
        port: 1234
      });
      var mock = nock("https://example.com:1234")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
        )
        .reply(200, "{}");

      pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", done);
    });

    it("should respect the timeout when specified", function(done) {
      var pusher = new Pusher({
        appId: 1234,
        key: "f00d",
        secret: "beef",
        timeout: 100
      });
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
          { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
        )
        .delayConnection(101)
        .reply(200);

      pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", function(error, request, response) {
        var expectedError = new Error("ESOCKETTIMEDOUT");
        expectedError.code = "ESOCKETTIMEDOUT";
        expectedError.connect = false;

        expect(error).to.be.a(Pusher.RequestError);
        expect(error.message).to.equal("Request failed with an error");
        expect(error.error).to.eql(expectedError);
        expect(error.url).to.match(
          /^http:\/\/api.pusherapp.com\/apps\/1234\/events\?auth_key=f00d&auth_timestamp=[0-9]+&auth_version=1\.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=[a-f0-9]+$/
        );
        expect(error.statusCode).to.equal(null);
        expect(error.body).to.equal(null);
        done();
      });
    });
  });

  describe("#triggerBatch", function(){
    it("should trigger multiple events in a single call", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=fd5ab5fd40237f27555c4d2564470fdd&auth_signature=Y",
          JSON.stringify({"batch":[{"channel":"integration","name":"event","data":"test"},{"channel":"integration2","name":"event2","data":"test2"}]})
        )
        .reply(200, "{}");

      pusher.triggerBatch([{
        channel: "integration",
        name: "event",
        data: "test"
      },
      {
        channel: "integration2",
        name: "event2",
        data: "test2"
      }], done);
    });

    it("should stringify data before posting", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=ade2e9d64d936215c2b2d6a6f4606ef9&auth_signature=Y",
          JSON.stringify({"batch":[{"channel":"integration","name":"event","data":"{\"hello\":\"world\"}"},{"channel":"integration2","name":"event2","data":"{\"hello2\":\"another world\"}"}]})
        )
        .reply(200, "{}");

      pusher.triggerBatch([{
        channel: "integration",
        name: "event",
        data: {
          hello: "world"
        }
      },
      {
        channel: "integration2",
        name: "event2",
        data: {
          hello2: "another world"
        }
      }], done);
    });
  })
});
