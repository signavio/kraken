// @flow
// @flow

type FulfilledPromiseT<BodyT, TypedValueT> = {|
  (body?: BodyT): void,

  status: number,

  value: TypedValueT,

  fulfilled: true,
  pending: false,
  rejected: false,
|}

type PendingPromiseT<BodyT, TypedValueT> = {|
  (body?: BodyT): void,

  status: number,

  value: ?TypedValueT,

  pending: true,
  fulfilled: false,
  rejected: false,
|}

type RejectedPromiseT<BodyT> = {|
  (body?: BodyT): void,

  status: number,

  value: void,

  rejected: true,
  reason: string,

  fulfilled: false,
  pending: false,
|}

export type PromiseT<BodyT, TypedValueT = BodyT> =
  | PendingPromiseT<BodyT, TypedValueT>
  | RejectedPromiseT<BodyT>
  | FulfilledPromiseT<BodyT, TypedValueT>
