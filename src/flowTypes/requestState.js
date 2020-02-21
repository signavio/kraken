// @flow
export type RequestMethod = 'fetch' | 'create' | 'update' | 'remove'

export type Query = {
  [key: string]: void | string | number | boolean,
}

export type RequestParams = {|
  [key: string]: void | boolean | number | string,
|}

type RequestBase = {|
  outstanding: boolean,

  refresh: any,
  query: Query,
  requestParams: RequestParams,
|}

type PendingRequest = {|
  ...RequestBase,

  pending: true,
  fulfilled: false,
  rejected: false,

  value: string | Array<string> | null,
|}

type FulfilledRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: true,
  rejected: false,

  status: number,

  value: string | Array<string>,
|}

type RejectedRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: false,
  rejected: true,

  reason: string,

  status: number,

  value: null,
|}

export type Request = PendingRequest | FulfilledRequest | RejectedRequest

export type RequestCollection = {|
  [requestId: string]: Request,
|}

export type RequestsState = {|
  [entityType: string]: RequestCollection,
|}
