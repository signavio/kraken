// @flow
import { type Query } from './api'

type RequestBase = {|
  outstanding: boolean,

  refresh: any,
  query: Query,
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

  value: string | Array<string>,
|}

type RejectedRequest = {|
  ...RequestBase,

  pending: false,
  fulfilled: false,
  rejected: true,

  reason: string,

  value: null,
|}

export type Request = PendingRequest | FulfilledRequest | RejectedRequest

export type RequestCollection = {|
  [requestId: string]: Request,
|}

export type RequestsState = {|
  [entityType: string]: RequestCollection,
|}
