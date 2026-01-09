import { Agent } from "http"
import { Response } from "node-fetch"

export = Pusher

declare class Pusher {
  constructor(opts: Pusher.Options)

  trigger(
    channel: string | Array<string>,
    event: string,
    data: any,
    params?: Pusher.TriggerParams
  ): Promise<Response>

  trigger(
    channel: string | Array<string>,
    event: string,
    data: any
  ): Promise<Response>

  triggerBatch(events: Array<Pusher.BatchEvent>): Promise<Response>

  get(opts: Pusher.GetOptions): Promise<Response>
  post(opts: Pusher.PostOptions): Promise<Response>

  /**
   * @deprecated Use authorizeChannel
   */
  authenticate(
    socketId: string,
    channel: string,
    data?: Pusher.PresenceChannelData
  ): Pusher.ChannelAuthResponse

  authorizeChannel(
    socketId: string,
    channel: string,
    data?: Pusher.PresenceChannelData
  ): Pusher.ChannelAuthResponse

  authenticateUser(
    socketId: string,
    userData: Pusher.UserChannelData
  ): Pusher.UserAuthResponse

  sendToUser(userId: string, event: string, data: any): Promise<Response>

  terminateUserConnections(userId: string): Promise<Response>

  webhook(request: Pusher.WebHookRequest): Pusher.WebHook
  createSignedQueryString(opts: Pusher.SignedQueryStringOptions): string
}

declare namespace Pusher {
  export function forCluster(cluster: string, opts: BaseOptions): Pusher
  export function forURL(
    connectionString: string,
    opts?: Partial<Options>
  ): Pusher

  export interface BaseOptions {
    appId: string
    key: string
    secret: string
    useTLS?: boolean
    encrypted?: boolean
    timeout?: number
    agent?: Agent
    encryptionMasterKeyBase64?: string
  }
  interface ClusterOptions extends BaseOptions {
    cluster: string
  }
  interface HostOptions extends BaseOptions {
    host: string
    port?: string
  }

  export type Options = ClusterOptions | HostOptions

  export interface TriggerParams {
    socket_id?: string
    info?: string
  }

  export interface BatchEvent {
    channel: string
    name: string
    data: any
    socket_id?: string
    info?: string
  }

  type ReservedParams =
    | "auth_key"
    | "auth_timestamp"
    | "auth_version"
    | "auth_signature"
    | "body_md5"

  // I can't help but feel that this is a bit of a hack, but it seems to be the
  // best way of defining a type which allows any key except some known set.
  // Relies on the observation that if a reserved key is provided, it must fit
  // the RHS of the intersection, and have type `never`.
  //
  // https://stackoverflow.com/a/58594586
  export type Params = { [key: string]: any } & {
    [K in ReservedParams]?: never
  }

  export interface RequestOptions {
    path: string
    params?: Params
  }
  export type GetOptions = RequestOptions
  export interface PostOptions extends RequestOptions {
    body: string
  }
  export interface SignedQueryStringOptions {
    method: string
    path: string
    body?: string
    params?: Params
  }

  /**
   * @deprecated Use ChannelAuthResponse
   */
  export interface AuthResponse {
    auth: string
    channel_data?: string
    shared_secret?: string
  }

  export interface ChannelAuthResponse {
    auth: string
    channel_data?: string
    shared_secret?: string
  }

  export interface UserAuthResponse {
    auth: string
    user_data: string
  }

  export interface PresenceChannelData {
    user_id: string
    user_info?: {
      [key: string]: any
    }
  }

  export interface UserChannelData {
    id: string
    [key: string]: any
  }

  export interface WebHookRequest {
    headers: object
    rawBody: string
  }

  interface Event {
    name: string
    channel: string
    event: string
    data: string
    socket_id: string
  }

  interface WebHookData {
    time_ms: number
    events: Array<Event>
  }

  export interface Token {
    key: string
    secret: string
  }

  export class WebHook {
    constructor(token: Token, request: WebHookRequest)

    isValid(extraTokens?: Token | Array<Token>): boolean
    isContentTypeValid(): boolean
    isBodyValid(): boolean
    getData(): WebHookData
    getEvents(): Array<Event>
    getTime(): Date
  }

  export class RequestError extends Error {
    constructor(
      message: string,
      url: string,
      error: Error,
      status?: number,
      body?: string
    )
    url: string
    error: Error
    status?: number
    body?: string
  }

  export class WebHookError extends Error {
    constructor(
      message: string,
      contentType: string,
      body: string,
      signature: string
    )
    contentType: string
    body: string
    signature: string
  }

  export { Response }
}
