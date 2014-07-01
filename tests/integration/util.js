var expect = require("expect.js");

var util = require("../../lib/util");

describe("util", function() {
  var pusher;

  describe(".toOrderedArray", function() {
    it("should return an empty array for an empty object", function() {
      expect(util.toOrderedArray({})).to.eql([]);
    });

    it("should return a one-element array for an object with one key", function() {
      expect(util.toOrderedArray({ xxx: 123 })).to.eql(["xxx=123"]);
    });

    it("should return an array sorted by object keys for an object with multiple keys", function() {
      expect(util.toOrderedArray({ xxx: 123, aaa: 1, foo: "string" })).to.eql(
        ["aaa=1", "foo=string", "xxx=123"]
      );
    });
  });
});
