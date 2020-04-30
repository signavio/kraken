// @flow
import {
  type FulfilledKrakenRequest,
  type FutureKrakenRequest,
  type PendingKrakenRequest,
  type RejectedKrakenRequest,
} from './requestState'

export type FutureRequest<Value> = {|
  ...FutureKrakenRequest,

  value: ?Value,
|}

export type FulfilledRequest<Value> = {|
  ...FulfilledKrakenRequest,

  status: number,

  value: Value,
|}

type FulfilledPromise<Value, Body> = {|
  (body: ?Body): void,

  ...FulfilledRequest<Value>,
|}

export type PendingRequest<Value> = {|
  ...PendingKrakenRequest,

  value: ?Value,
|}

type PendingPromise<Value, Body> = {|
  (body: ?Body): void,

  ...PendingRequest<Value>,
|}

export type RejectedRequest = {|
  ...RejectedKrakenRequest,

  status: number,
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
  | FutureRequest<Value>
  | PendingRequest<Value>
  | RejectedRequest
  | FulfilledRequest<Value>

export type RequestAction<Body> = (body: ?Body) => void
