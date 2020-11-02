import { Agent } from "https"

import * as Pusher from "pusher"

const pusher = Pusher.forURL(process.env.PUSHER_URL, {
  encryptionMasterKeyBase64: Buffer.from(
    "01234567890123456789012345678901"
  ).toString("base64"),
  agent: new Agent({ keepAlive: true }),
})

pusher
  .get({
    path: "/channels",
    params: { filter_by_prefix: "presence-" },
  })
  .then((response: Pusher.Response) => {
    console.log(`received response with status ${response.status}`)
    return response.text().then((body) => {
      console.log(`and body ${body}`)
    })
  })
  .catch((err) => {
    console.log(`received error ${err}`)
  })

const authResponse: Pusher.AuthResponse = pusher.authenticate(
  "123.456",
  "private-encrypted-example",
  {
    user_id: "foo",
    user_info: { bar: 42 },
  }
)
