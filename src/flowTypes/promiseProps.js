// @flow

type FulfilledPromise<Body, Value> = {|
  (body?: Body): void,

  status: number,

  value: Value,

  fulfilled: true,
  pending: false,
  rejected: false,
|}

type PendingPromise<Body, Value> = {|
  (body?: Body): void,

  status: number,

  value: ?Value,

  pending: true,
  fulfilled: false,
  rejected: false,
|}

type RejectedPromise<Body> = {|
  (body?: Body): void,

  status: number,

  value: void,

  rejected: true,
  reason: string,

  fulfilled: false,
  pending: false,
|}

export type PromiseProp<Body, Value = Body> =
  | PendingPromise<Body, Value>
  | RejectedPromise<Body>
  | FulfilledPromise<Body, Value>
