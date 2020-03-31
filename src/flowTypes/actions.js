// @flow
import { type MetaData } from './metaData'
import { type Query } from './requestState'

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
  type: '@@kraken/CREATE_DISPATCH',
  payload: DispatchPayload,
}

export type FetchDispatchAction = {
  type: '@@kraken/FETCH_DISPATCH',
  payload: DispatchPayload,
}

export type UpdateDispatchAction = {
  type: '@@kraken/UPDATE_DISPATCH',
  payload: DispatchPayload,
}

export type RemoveDispatchAction = {
  type: '@@kraken/REMOVE_DISPATCH',
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
  type: '@@kraken/CREATE_SUCCESS',
  payload: CreateSuccessPayload,
}

export type UpdateSuccessAction = {
  type: '@@kraken/UPDATE_SUCCESS',
  payload: UpdateSuccessPayload,
}

export type FetchSuccessAction = {
  type: '@@kraken/FETCH_SUCCESS',
  payload: FetchSuccessPayload,
}

export type RemoveSuccessAction = {
  type: '@@kraken/REMOVE_SUCCESS',
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
  type: '@@kraken/CREATE_FAILURE',
  payload: CreateFailurePayload,
}

export type UpdateFailureAction = {
  type: '@@kraken/UPDATE_FAILURE',
  payload: UpdateFailurePayload,
}

export type FetchFailureAction = {
  type: '@@kraken/FETCH_FAILURE',
  payload: FetchFailurePayload,
}

export type RemoveFailureAction = {
  type: '@@kraken/REMOVE_FAILURE',
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
  type: '@@kraken/REQUEST_START',
  payload: RequestStartPayload,
}

export type WipeAction = {|
  type: '@@kraken/WIPE_CACHE',
|}

export type AddMetaDataPayload = MetaData

export type AddMetaDataAction = {|
  type: '@@kraken/ADD_META_DATA',
  payload: AddMetaDataPayload,
|}

export type Action =
  | DispatchAction
  | SuccessAction
  | FailureAction
  | RequestStartAction
  | WipeAction
  | AddMetaDataAction
