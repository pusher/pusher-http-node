const Token = require("./token")
const isBase64 = require("is-base64")

function Config(options) {
  options = options || {}

  let useTLS = false
  if (options.useTLS !== undefined && options.encrypted !== undefined) {
    throw new Error(
      "Cannot set both `useTLS` and `encrypted` configuration options"
    )
  } else if (options.useTLS !== undefined) {
    useTLS = options.useTLS
  } else if (options.encrypted !== undefined) {
    // `encrypted` deprecated in favor of `useTLS`
    console.warn("`encrypted` option is deprecated in favor of `useTLS`")
    useTLS = options.encrypted
  }
  this.scheme = options.scheme || (useTLS ? "https" : "http")
  this.port = options.port

  this.appId = options.appId
  this.token = new Token(options.key, options.secret)

  this.timeout = options.timeout
  this.agent = options.agent

  // Handle deprecated raw 32 byte string as key
  if (options.encryptionMasterKey !== undefined) {
    if (options.encryptionMasterKeyBase64 !== undefined) {
      throw new Error(
        "Do not specify both encryptionMasterKey and encryptionMasterKeyBase64. " +
          "encryptionMasterKey is deprecated, please specify only encryptionMasterKeyBase64."
      )
    }
    console.warn(
      "`encryptionMasterKey` option is deprecated in favor of `encryptionMasterKeyBase64`"
    )
    if (typeof options.encryptionMasterKey !== "string") {
      throw new Error("encryptionMasterKey must be a string")
    }
    if (options.encryptionMasterKey.length !== 32) {
      throw new Error(
        "encryptionMasterKey must be 32 bytes long, but the string '" +
          options.encryptionMasterKey +
          "' is " +
          options.encryptionMasterKey.length +
          " bytes long"
      )
    }

    this.encryptionMasterKey = Buffer.from(options.encryptionMasterKey)
  }

  // Handle base64 encoded 32 byte key to encourage use of the full range of byte values
  if (options.encryptionMasterKeyBase64 !== undefined) {
    if (typeof options.encryptionMasterKeyBase64 !== "string") {
      throw new Error("encryptionMasterKeyBase64 must be a string")
    }
    if (!isBase64(options.encryptionMasterKeyBase64)) {
      throw new Error("encryptionMasterKeyBase64 must be valid base64")
    }

    const decodedKey = Buffer.from(options.encryptionMasterKeyBase64, "base64")
    if (decodedKey.length !== 32) {
      throw new Error(
        "encryptionMasterKeyBase64 must decode to 32 bytes, but the string " +
          options.encryptionMasterKeyBase64 +
          "' decodes to " +
          decodedKey.length +
          " bytes"
      )
    }

    this.encryptionMasterKey = decodedKey
  }
}

Config.prototype.prefixPath = function () {
  throw "NotImplementedError: #prefixPath should be implemented by subclasses"
}

Config.prototype.getBaseURL = function () {
  const port = this.port ? ":" + this.port : ""
  return this.scheme + "://" + this.host + port
}

module.exports = Config
