// @flow
export type RequestMethod = 'fetch' | 'create' | 'update' | 'remove'

export type Query = {
  [key: string]: void | string | number | boolean,
}

export type RequestParams = {|
  [key: string]: void | boolean | number | string,
|}

type RequestBase = {|
  refresh: void | string | number,
  query: ?Query,
  requestParams: ?RequestParams,
|}

type OutstandingRequest = {|
  ...RequestBase,

  outstanding: true,

  pending: false,
  fulfilled: false,
  rejected: false,

  value: null,
|}

type PendingRequest = {|
  ...RequestBase,

  outstanding: false,

  pending: true,
  fulfilled: false,
  rejected: false,

  value: string | Array<string> | null,
|}

type FulfilledRequest = {|
  ...RequestBase,

  outstanding: false,

  pending: false,
  fulfilled: true,
  rejected: false,

  status: number,

  value: string | Array<string>,
|}

type RejectedRequest = {|
  ...RequestBase,

  outstanding: false,

  pending: false,
  fulfilled: false,
  rejected: true,

  reason: string,

  status: number,

  value: null,
|}

export type Request =
  | OutstandingRequest
  | PendingRequest
  | FulfilledRequest
  | RejectedRequest

export type RequestCollection = {|
  [requestId: string]: Request,
|}

export type RequestsState = {|
  [entityType: string]: RequestCollection,
|}
