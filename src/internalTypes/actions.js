// @flow
import { type Query } from './founddation'

///////////////////
// Payload Types //
///////////////////

export type Body = {
  [key: string]: any,
}

type PayloadBase = {|
  query: Query,

  entityType: string,
|}

////////////////////////////
// Dispatch Payload Types //
////////////////////////////

export type DispatchPayload = {|
  ...PayloadBase,

  body: Body,
  elementId: string,
  denormalizeValue: boolean,
|}

///////////////////////////
// Success Payload Types //
///////////////////////////

type AfterDispatchBasePayload = {|
  ...PayloadBase,

  requestId: string,
|}

export type CreateSuccessPayload = {|
  ...AfterDispatchBasePayload,

  result: string | Array<string>,
  entities: Array<any>,
|}

export type UpdateSuccessPayload = {|
  ...AfterDispatchBasePayload,

  result: string | Array<string>,
  entities: Array<any>,
|}

export type FetchSuccessPayload = {|
  ...AfterDispatchBasePayload,

  result: string | Array<string>,
  entities: Array<any>,
  isCachedResponse: boolean,
|}

export type RemoveSuccessPayload = {|
  ...AfterDispatchBasePayload,
  result: string | Array<string>,
  entities: Array<any>,
|}

export type SuccessPayload =
  | CreateSuccessPayload
  | UpdateSuccessPayload
  | FetchSuccessPayload
  | RemoveSuccessPayload

///////////////////////////
// Failure Payload Types //
///////////////////////////

export type CreateFailurePayload = {|
  ...AfterDispatchBasePayload,

  error: string,
  status?: number,
|}

export type UpdateFailurePayload = {|
  ...AfterDispatchBasePayload,

  error: string,
  status?: number,
|}

export type FetchFailurePayload = {|
  ...AfterDispatchBasePayload,

  error: string,
  status?: number,
|}

export type RemoveFailurePayload = {|
  ...AfterDispatchBasePayload,

  error: string,
  status?: number,
|}

export type FailurePayload =
  | CreateFailurePayload
  | UpdateFailurePayload
  | FetchFailurePayload
  | RemoveFailurePayload

export type RequestStartPayload = {|
  ...AfterDispatchBasePayload,
|}

export type Payload =
  | DispatchPayload
  | SuccessPayload
  | FailurePayload
  | RequestStartPayload

//////////////////
// Action Types //
//////////////////

///////////////////////////
// Dispatch Action Types //
///////////////////////////

export type CreateDispatchAction = {
  type: 'KRAKEN_CREATE_DISPATCH',
  payload: DispatchPayload,
}

export type FetchDispatchAction = {
  type: 'KRAKEN_FETCH_DISPATCH',
  payload: DispatchPayload,
}

export type UpdateDispatchAction = {
  type: 'KRAKEN_UPDATE_DISPATCH',
  payload: DispatchPayload,
}

export type RemoveDispatchAction = {
  type: 'KRAKEN_REMOVE_DISPATCH',
  payload: DispatchPayload,
}

export type DispatchAction =
  | FetchDispatchAction
  | CreateDispatchAction
  | UpdateDispatchAction
  | RemoveDispatchAction

export type DispatchT = (payload: DispatchPayload) => DispatchAction

//////////////////////////
// Success Action Types //
//////////////////////////

export type CreateSuccessAction = {
  type: 'KRAKEN_CREATE_SUCCESS',
  payload: CreateSuccessPayload,
}

export type UpdateSuccessAction = {
  type: 'KRAKEN_UPDATE_SUCCESS',
  payload: UpdateSuccessPayload,
}

export type FetchSuccessAction = {
  type: 'KRAKEN_FETCH_SUCCESS',
  payload: FetchSuccessPayload,
}

export type RemoveSuccessAction = {
  type: 'KRAKEN_REMOVE_SUCCESS',
  payload: RemoveSuccessPayload,
}

export type SuccessAction =
  | FetchSuccessAction
  | CreateSuccessAction
  | UpdateSuccessAction
  | RemoveSuccessAction

//////////////////////////
// Failure Action Types //
//////////////////////////

export type CreateFailureAction = {
  type: 'KRAKEN_CREATE_FAILURE',
  payload: CreateFailurePayload,
}

export type UpdateFailureAction = {
  type: 'KRAKEN_UPDATE_FAILURE',
  payload: UpdateFailurePayload,
}

export type FetchFailureAction = {
  type: 'KRAKEN_FETCH_FAILURE',
  payload: FetchFailurePayload,
}

export type RemoveFailureAction = {
  type: 'KRAKEN_REMOVE_FAILURE',
  payload: RemoveFailurePayload,
}

export type FailureAction =
  | FetchFailureAction
  | CreateFailureAction
  | UpdateFailureAction
  | RemoveFailureAction

//////////////////////////
// Other Action Types //
//////////////////////////

export type RequestStartAction = {
  type: 'KRAKEN_REQUEST_START',
  payload: RequestStartPayload,
}

export type Action =
  | DispatchAction
  | SuccessAction
  | FailureAction
  | RequestStartAction
