// @flow

type FulfilledRequest<Value> = {|
  status: number,

  value: Value,

  fulfilled: true,
  pending: false,
  rejected: false,
|}

type FulfilledPromise<Value, Body> = {|
  (body: ?Body): void,

  ...FulfilledRequest<Value>,
|}

type PendingRequest<Value> = {|
  value: ?Value,

  pending: true,
  fulfilled: false,
  rejected: false,
|}

type PendingPromise<Value, Body> = {|
  (body: ?Body): void,

  ...PendingRequest<Value>,
|}

type RejectedRequest = {|
  status: number,

  value: void,

  rejected: true,
  reason: string,

  fulfilled: false,
  pending: false,
|}

type RejectedPromise<Body> = {|
  (body: ?Body): void,

  ...RejectedRequest,
|}

export type PromiseProp<Value, Body = Value> =
  | PendingPromise<Value, Body>
  | RejectedPromise<Body>
  | FulfilledPromise<Value, Body>

export type RequestStatus<Value> =
  | PendingRequest<Value>
  | RejectedRequest
  | FulfilledRequest<Value>

export type RequestAction<Body> = (body: ?Body) => void
