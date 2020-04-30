// @flow
export type Query = {
  [key: string]: void | string | number | boolean,
}

type RequestBase = {|
  refresh: any,
  query: Query,
  requestParams: Query,

  outstanding: boolean,
|}

export type FutureKrakenRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: false,
  rejected: false,

  value: void | string | Array<string>,
|}

export type PendingKrakenRequest = {|
  ...RequestBase,

  pending: true,
  fulfilled: false,
  rejected: false,

  value: string | Array<string> | null,
|}

export type FulfilledKrakenRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: true,
  rejected: false,

  value: string | Array<string>,

  responseHeaders: Headers,
|}

export type RejectedKrakenRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: false,
  rejected: true,

  reason: string,

  value: null,
|}

export type Request =
  | PendingKrakenRequest
  | FulfilledKrakenRequest
  | RejectedKrakenRequest

export type RequestCollection = {|
  [requestId: string]: Request,
|}

export type RequestsState = {|
  [entityType: string]: RequestCollection,
|}
