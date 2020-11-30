// Redundant default as a workaround for this WebPack bug:
// https://github.com/webpack/webpack/issues/4742
const fetch = require("node-fetch").default
const AbortController = require("abort-controller").default

const errors = require("./errors")
const util = require("./util")

const pusherLibraryVersion = require("./version")

const RESERVED_QUERY_KEYS = {
  auth_key: true,
  auth_timestamp: true,
  auth_version: true,
  auth_signature: true,
  body_md5: true,
}

function send(config, options) {
  const method = options.method
  const path = config.prefixPath(options.path)
  const body = options.body ? JSON.stringify(options.body) : undefined

  const url = `${config.getBaseURL()}${path}?${createSignedQueryString(
    config.token,
    {
      method,
      path,
      params: options.params,
      body: body,
    }
  )}`

  const headers = {
    "x-pusher-library": "pusher-http-node " + pusherLibraryVersion,
  }

  if (body) {
    headers["content-type"] = "application/json"
  }

  let signal
  let timeout
  if (config.timeout) {
    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), config.timeout)
    signal = controller.signal
  }

  return fetch(url, {
    method,
    body,
    headers,
    signal,
    agent: config.agent,
  }).then(
    (res) => {
      clearTimeout(timeout)
      if (res.status >= 400) {
        return res.text().then((body) => {
          throw new errors.RequestError(
            "Unexpected status code " + res.status,
            url,
            undefined,
            res.status,
            body
          )
        })
      }
      return res
    },
    (err) => {
      clearTimeout(timeout)
      throw new errors.RequestError("Request failed with an error", url, err)
    }
  )
}

function createSignedQueryString(token, request) {
  const timestamp = (Date.now() / 1000) | 0

  const params = {
    auth_key: token.key,
    auth_timestamp: timestamp,
    auth_version: "1.0",
  }

  if (request.body) {
    params.body_md5 = util.getMD5(request.body)
  }

  if (request.params) {
    for (const key in request.params) {
      if (RESERVED_QUERY_KEYS[key] !== undefined) {
        throw Error(key + " is a required parameter and cannot be overidden")
      }
      params[key] = request.params[key]
    }
  }

  const method = request.method.toUpperCase()
  const sortedKeyVal = util.toOrderedArray(params)
  let queryString = sortedKeyVal.join("&")

  const signData = [method, request.path, queryString].join("\n")
  queryString += "&auth_signature=" + token.sign(signData)

  return queryString
}

exports.send = send
exports.createSignedQueryString = createSignedQueryString
