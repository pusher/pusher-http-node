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

  describe("#triggerBatch", function() {
    it("should send the event when no callback is given", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=3778a4e3d3f37b4d51519d5f2c976ed4&auth_signature=Y",
          { batch: [{ channel: "test_channel", name: "my_event", data: "{\"some\":\"data \"}" }] }
        )
        .reply(200, "{}");

      pusher.triggerBatch([{channel: "test_channel", name: "my_event", data: { some: "data "}}]);
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
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=195df936082a33785436ae240d49640a&auth_signature=Y",
          { batch: [{ channel: "one", name: "my_event", data: "{\"some\":\"data \"}" }] }
        )
        .reply(200, "{}");

      pusher.triggerBatch([{channel: "one", name: "my_event", data: { some: "data "}}], done);
    });

    it("should multiple events around", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=8cd8d942c5c7aac3ecfb44e1c5225455&auth_signature=Y",
          { batch: [
            { channel: "one", name: "my_event1", data: "{\"some\":\"data1\"}" },
            { channel: "two", name: "my_event2", data: "{\"some\":\"data2\"}" },
            { channel: "three", name: "my_event3", data: "{\"some\":\"data3\"}" }
          ]}
        )
        .reply(200, "{}");

      pusher.triggerBatch([
        { channel: "one", name: "my_event1", data: {"some":"data1"} },
        { channel: "two", name: "my_event2", data: {"some":"data2"} },
        { channel: "three", name: "my_event3", data: {"some":"data3"} }
      ], done);
    });

    it("should not serialize strings into JSON", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=9fb6ea8b5c8f62d198feb2e240c47d8e&auth_signature=Y",
          { batch: [{ channel: "test", name: "test_event", data: "test string" }] }
        )
        .reply(200, "{}");

      pusher.triggerBatch([{channel: "test", name: "test_event", data: "test string"}], done);
    });

    it("should support socket_id in events", function(done) {
      var mock = nock("http://api.pusherapp.com")
        .filteringPath(function(path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
        })
        .post(
          "/apps/1234/batch_events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=ca0eef5f62e2e2663efa400ca5145373&auth_signature=Y",
          { batch: [{ channel: "test_channel", name: "my_event", data: "{\"some\":\"data \"}", socket_id: "123.567" }] }
        )
        .reply(200, "{}");

      pusher.triggerBatch([{ channel: "test_channel", name: "my_event", data: { some: "data "}, socket_id: "123.567" }], done);
    });

    // it("should call back with the result", function(done) {
    //   var mock = nock("http://api.pusherapp.com")
    //     .filteringPath(function(path) {
    //       return path
    //         .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
    //         .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
    //     })
    //     .post(
    //       "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
    //       { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
    //     )
    //     .reply(200, "OK");
    //
    //   pusher.trigger("test_channel", "my_event", { some: "data "}, null, function(error, request, response) {
    //     expect(error).to.be(null);
    //     expect(response.statusCode).to.equal(200);
    //     done();
    //   });
    // });
    //
    // it("should call back with a RequestError if Pusher responds with 4xx", function(done) {
    //   var mock = nock("http://api.pusherapp.com")
    //     .filteringPath(function(path) {
    //       return path
    //         .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
    //         .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
    //     })
    //     .post(
    //       "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=Y",
    //       { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"] }
    //     )
    //     .reply(400, "Error");
    //
    //   pusher.trigger("test_channel", "my_event", { some: "data "}, null, function(error, request, response) {
    //     expect(error).to.be.a(Pusher.RequestError);
    //     expect(error.message).to.equal("Unexpected status code 400");
    //     expect(error.url).to.match(
    //       /^http:\/\/api.pusherapp.com\/apps\/1234\/events\?auth_key=f00d&auth_timestamp=[0-9]+&auth_version=1\.0&body_md5=cf87d666b4a829a54fc44b313584b2d7&auth_signature=[a-f0-9]+$/
    //     );
    //     expect(error.statusCode).to.equal(400);
    //     expect(error.body).to.equal("Error");
    //     done();
    //   });
    // });
    //
    // it("should allow channel names with special characters: _ - = @ , . ;", function(done) {
    //   var mock = nock("http://api.pusherapp.com")
    //     .filteringPath(function(path) {
    //       return path
    //         .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
    //         .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
    //     })
    //     .post(
    //       "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=024f0f297e27e131c8ec2c8817d153f4&auth_signature=Y",
    //       { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_-=@,.;channel"] }
    //     )
    //     .reply(200, "OK");
    //
    //   pusher.trigger("test_-=@,.;channel", "my_event", { some: "data "}, null, function(error, request, response) {
    //     expect(error).to.be(null);
    //     expect(response.statusCode).to.equal(200);
    //     done();
    //   });
    // });
    //
    // it("should throw an error if called with more than 10 channels", function() {
    //   expect(function() {
    //     pusher.trigger(
    //       ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"], "x", {}
    //     );
    //   }).to.throwError(function(e) {
    //     expect(e).to.be.an(Error);
    //     expect(e.message).to.equal(
    //       "Can't trigger a message to more than 10 channels"
    //     );
    //   });
    // });

    it("should throw an error if channel name is empty", function() {
      expect(function() {
        pusher.triggerBatch([{channel: "", name: "test", data: ""}]);
      }).to.throwError(function(e) {
        expect(e).to.be.an(Error);
        expect(e.message).to.equal("Invalid channel name: ''");
      });
    });

    // it("should throw an error if channel name is invalid", function() {
    //   expect(function() {
    //     pusher.trigger("abc$", "test");
    //   }).to.throwError(function(e) {
    //     expect(e).to.be.an(Error);
    //     expect(e.message).to.equal("Invalid channel name: 'abc$'");
    //   });
    // });
    //
    // it("should throw an error if channel name is longer than 200 characters", function() {
    //   var channel = new Array(202).join("x"); // 201 characters
    //   expect(function() {
    //     pusher.trigger(channel, "test");
    //   }).to.throwError(function(e) {
    //     expect(e).to.be.an(Error);
    //     expect(e.message).to.equal("Channel name too long: '" + channel + "'");
    //   });
    // });
    //
    // it("should throw an error if event name is longer than 200 characters", function() {
    //   var event = new Array(202).join("x"); // 201 characters
    //   expect(function() {
    //     pusher.trigger("test", event);
    //   }).to.throwError(function(e) {
    //     expect(e).to.be.an(Error);
    //     expect(e.message).to.equal("Too long event name: '" + event + "'");
    //   });
    // });
    //
    // it("should respect the encryption, host and port config", function(done) {
    //   var pusher = new Pusher({
    //     appId: 1234,
    //     key: "f00d",
    //     secret: "beef",
    //     encrypted: true,
    //     host: "example.com",
    //     port: 1234
    //   });
    //   var mock = nock("https://example.com:1234")
    //     .filteringPath(function(path) {
    //       return path
    //         .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
    //         .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
    //     })
    //     .post(
    //       "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
    //       { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
    //     )
    //     .reply(200, "{}");
    //
    //   pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", done);
    // });
    //
    // it("should respect the timeout when specified", function(done) {
    //   var pusher = new Pusher({
    //     appId: 1234,
    //     key: "f00d",
    //     secret: "beef",
    //     timeout: 200
    //   });
    //   var mock = nock("http://api.pusherapp.com")
    //     .filteringPath(function(path) {
    //       return path
    //         .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
    //         .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y");
    //     })
    //     .post(
    //       "/apps/1234/events?auth_key=f00d&auth_timestamp=X&auth_version=1.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=Y",
    //       { name: "my_event", data: "{\"some\":\"data \"}", channels: ["test_channel"], socket_id: "123.567" }
    //     )
    //     .delayConnection(200)
    //     .reply(200);
    //
    //   pusher.trigger("test_channel", "my_event", { some: "data "}, "123.567", function(error, request, response) {
    //     var expectedError = new Error("ETIMEDOUT");
    //     expectedError.code = "ETIMEDOUT";
    //
    //     expect(error).to.be.a(Pusher.RequestError);
    //     expect(error.message).to.equal("Request failed with an error");
    //     expect(error.error).to.eql(expectedError);
    //     expect(error.url).to.match(
    //       /^http:\/\/api.pusherapp.com\/apps\/1234\/events\?auth_key=f00d&auth_timestamp=[0-9]+&auth_version=1\.0&body_md5=0478e1ed73804ae1be97cfa6554cf039&auth_signature=[a-f0-9]+$/
    //     );
    //     expect(error.statusCode).to.equal(null);
    //     expect(error.body).to.equal(null);
    //     done();
    //   });
    // });
  });
});
