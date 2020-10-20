const expect = require("expect.js")
const nock = require("nock")

const Pusher = require("../../../lib/pusher")

describe("Pusher", function () {
  let pusher

  beforeEach(function () {
    pusher = new Pusher({ appId: 999, key: "111111", secret: "tofu" })
    nock.disableNetConnect()
  })

  afterEach(function () {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe("#get", function () {
    it("should set the correct path and include all params", function (done) {
      nock("http://api.pusherapp.com")
        .filteringPath(function (path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y")
        })
        .get(
          "/apps/999/channels?auth_key=111111&auth_timestamp=X&auth_version=1.0&filter_by_prefix=presence-&info=user_count,subscription_count&auth_signature=Y"
        )
        .reply(200, "{}")

      pusher
        .get({
          path: "/channels",
          params: {
            filter_by_prefix: "presence-",
            info: "user_count,subscription_count",
          },
        })
        .then(() => done())
        .catch(done)
    })

    it("should resolve to the response", function (done) {
      nock("http://api.pusherapp.com")
        .filteringPath(function (path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y")
        })
        .get(
          "/apps/999/test?auth_key=111111&auth_timestamp=X&auth_version=1.0&auth_signature=Y"
        )
        .reply(200, '{"test key": "test value"}')

      pusher
        .get({ path: "/test", params: {} })
        .then((response) => {
          expect(response.status).to.equal(200)
          return response.text().then((body) => {
            expect(body).to.equal('{"test key": "test value"}')
            done()
          })
        })
        .catch(done)
    })

    it("should reject with a RequestError if Pusher responds with 4xx", function (done) {
      nock("http://api.pusherapp.com")
        .filteringPath(function (path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y")
        })
        .get(
          "/apps/999/test?auth_key=111111&auth_timestamp=X&auth_version=1.0&auth_signature=Y"
        )
        .reply(400, "Error")

      pusher.get({ path: "/test", params: {} }).catch((error) => {
        expect(error).to.be.a(Pusher.RequestError)
        expect(error.message).to.equal("Unexpected status code 400")
        expect(error.url).to.match(
          /^http:\/\/api.pusherapp.com\/apps\/999\/test\?auth_key=111111&auth_timestamp=[0-9]+&auth_version=1\.0&auth_signature=[a-f0-9]+$/
        )
        expect(error.status).to.equal(400)
        expect(error.body).to.equal("Error")
        done()
      })
    })

    it("should respect the encryption, host and port config", function (done) {
      const pusher = new Pusher({
        appId: 999,
        key: "111111",
        secret: "tofu",
        useTLS: true,
        host: "example.com",
        port: 1234,
      })
      nock("https://example.com:1234")
        .filteringPath(function (path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y")
        })
        .get(
          "/apps/999/test?auth_key=111111&auth_timestamp=X&auth_version=1.0&auth_signature=Y"
        )
        .reply(200, '{"test key": "test value"}')

      pusher
        .get({ path: "/test", params: {} })
        .then(() => done())
        .catch(done)
    })

    it("should respect the timeout when specified", function (done) {
      const pusher = new Pusher({
        appId: 999,
        key: "111111",
        secret: "tofu",
        timeout: 100,
      })
      nock("http://api.pusherapp.com")
        .filteringPath(function (path) {
          return path
            .replace(/auth_timestamp=[0-9]+/, "auth_timestamp=X")
            .replace(/auth_signature=[0-9a-f]{64}/, "auth_signature=Y")
        })
        .get(
          "/apps/999/test?auth_key=111111&auth_timestamp=X&auth_version=1.0&auth_signature=Y"
        )
        .delayConnection(101)
        .reply(200)

      pusher.get({ path: "/test", params: {} }).catch((error) => {
        expect(error).to.be.a(Pusher.RequestError)
        expect(error.message).to.equal("Request failed with an error")
        expect(error.error.name).to.eql("AbortError")
        expect(error.url).to.match(
          /^http:\/\/api.pusherapp.com\/apps\/999\/test\?auth_key=111111&auth_timestamp=[0-9]+&auth_version=1\.0&auth_signature=[a-f0-9]+$/
        )
        expect(error.status).to.equal(undefined)
        expect(error.body).to.equal(undefined)
        done()
      })
    })
  })
})
