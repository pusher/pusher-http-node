import request = require('request');

export = Pusher;

declare class Pusher {
  constructor(opts: Pusher.Options);

  trigger(
    channel: string | Array<string>,
    event: string,
    data: any,
    socketId?: string,
    callback?: Pusher.Callback,
  ): void;

  trigger(
    channel: string | Array<string>,
    event: string,
    data: any,
    callback?: Pusher.Callback,
  ): void;

  triggerBatch(
    events: Array<Pusher.BatchEvent>,
    callback?: Pusher.Callback,
  ): void;

  get(opts: Pusher.GetOptions, callback: Pusher.Callback): void;
  post(opts: Pusher.PostOptions, callback: Pusher.Callback): void;

  authenticate(
    socketId: string,
    channel: string,
    data?: Pusher.PresenceChannelData,
  ): Pusher.AuthResponse;

  webhook(request: Pusher.WebHookRequest): Pusher.WebHook;
  createSignedQueryString(opts: Pusher.SignedQueryStringOptions): string;
}

declare namespace Pusher {
  export function forCluster(cluster: string, opts: BaseOptions): Pusher;
  export function forURL(connectionString: string): Pusher;

  export type Callback = (
    error: any,
    request: request.Request,
    response: request.Response,
  ) => void;

  export interface BaseOptions {
    appId: string;
    key: string;
    secret: string;
    useTLS?: boolean;
    encrypted?: boolean;
    proxy?: string;
    timeout?: number;
    keepAlive?: boolean;
  }
  interface ClusterOptions extends BaseOptions {
    cluster: string;
  }
  interface HostOptions extends BaseOptions {
    host: string;
    port?: string;
  }

  export type Options = ClusterOptions | HostOptions;

  export interface BatchEvent {
    channel: string;
    name: string;
    data: any;
  }

  // TODO Would be good to forbid specific keys in params obj
  // auth_key
  // auth_timestamp
  // auth_version
  // auth_signature
  // body_md5
  export type Params = object;

  export interface RequestOptions {
    path: string;
    params?: Params;
  }
  export type GetOptions = RequestOptions;
  export interface PostOptions extends RequestOptions {
    body: string;
  }
  export interface SignedQueryStringOptions {
    method: string;
    path: string;
    body?: string;
    params?: Params;
  }

  export interface AuthResponse {
    channel_data?: string;
    auth: string;
  }

  export interface PresenceChannelData {
    user_id: string;
  }

  export interface WebHookRequest {
    headers: object;
    rawBody: string;
  }

  interface Event {
    name: string;
    channel: string;
    event: string;
    data: string;
    socket_id: string;
  }

  interface WebHookData {
    time_ms: number;
    events: Array<Event>;
  }

  export interface Token {
    key: string;
    secret: string;
  }

  export class WebHook {
    constructor(token: Token, request: request.Request);

    isValid(extraTokens?: Token | Array<Token>): boolean;
    isContentTypeValid(): boolean;
    isBodyValid(): boolean;
    getData(): WebHookData;
    getEvents(): Array<Event>;
    getTime(): Date;
  }
}
