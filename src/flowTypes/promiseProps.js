// @flow

type FulfilledPromise<Value, Body> = {|
  (body?: Body): void,

  status: number,

  value: Value,

  fulfilled: true,
  pending: false,
  rejected: false,
|}

type PendingPromise<Value, Body> = {|
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

export type PromiseProp<Value, Body = Value> =
  | PendingPromise<Value, Body>
  | RejectedPromise<Body>
  | FulfilledPromise<Value, Body>
