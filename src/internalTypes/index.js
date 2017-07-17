import { schema } from 'normalizr'

export type EntityId = string
export type RequestId = string

export type Entity = any
export type EntityType = string

export type Request = {
  pending: boolean,
  fulfilled: boolean,
  rejected: boolean,
  outstanding: boolean,
  reason: string,

  result: EntityId | EntityId[] | null,

  validUntil: number,
  refresh: any,
}

export type RequestsState = {
  [entityType: string]: {
    [requestId: string]: Request,
  },
}

export type EntitiesState = {
  [collection: string]: {
    [entityId: string]: Entity,
  },
}

export type State = {
  kraken: {
    requests: RequestsState,
    entities: EntitiesState,
  },
}

export type normalizrResult = { response: { result: any, entities: any } } | { error: any }

export type ApiType = {
  collection: string,
  schema: schema.Entity,

  fetch?: (any) => normalizrResult,
  create?: (any) => normalizrResult,
  remove?: (any) => normalizrResult,
  update?: (any) => normalizrResult,
}

export type ApiTypeMap = {
  [name: string]: ApiType,
}

export type MethodName = 'create' | 'fetch' | 'remove' | 'update'

export type StateGetter = () => State

///////////////////
// Payload Types //
///////////////////

export type Query = {
  [key: string]: any,
}

export type Body = {
  [key: string]: any,
}

////////////////////////////
// Dispatch Payload Types //
////////////////////////////

export type CreateDispatchPayload = {
  query: Query,
  body: Body,
  elementId: string,
  entityType: string,
}

export type UpdateDispatchPayload = {
  query: Query,
  body: Body,
  elementId: string,
  entityType: string,
}

export type FetchDispatchPayload = {
  query: Query,
  elementId: string,
  entityType: string,
  refresh: any,
}

export type RemoveDispatchPayload = {
  query: Query,
  entityType: string,
}

export type DispatchPayload
  = CreateDispatchPayload
  | UpdateDispatchPayload
  | FetchDispatchPayload
  | RemoveDispatchPayload

///////////////////////////
// Success Payload Types //
///////////////////////////

export type CreateSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | EntityId[],
  entities: Entity[],
}

export type UpdateSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | EntityId[],
  entities: Entity[],
}

export type FetchSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | EntityId[],
  entities: Entity[],
  isCachedResponse: boolean,
}

export type RemoveSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | EntityId[],
  entities: Entity[],
}

export type SuccessPayload
  = CreateSuccessPayload
  | UpdateSuccessPayload
  | FetchSuccessPayload
  | RemoveSuccessPayload

///////////////////////////
// Failure Payload Types //
///////////////////////////

export type CreateFailurePayload = {
  requestId: RequestId,
  entityType: string,
  error: string,
}

export type UpdateFailurePayload = {
  requestId: RequestId,
  entityType: string,
  error: string,
}

export type FetchFailurePayload = {
  requestId: RequestId,
  entityType: string,
  error: string,
}

export type RemoveFailurePayload = {
  requestId: RequestId,
  entityType: string,
  error: string,
}

export type FailurePayload
  = CreateFailurePayload
  | UpdateFailurePayload
  | FetchFailurePayload
  | RemoveFailurePayload


export type RequestStartPayload = {
  entityType: string,
  requestId: RequestId,
}


export type Payload
  = DispatchPayload
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
  type: 'GENERIC_API_CREATE_DISPATCH',
  payload: CreateDispatchPayload,
}

export type FetchDispatchAction = {
  type: 'GENERIC_API_FETCH_DISPATCH',
  payload: FetchDispatchPayload,
}

export type UpdateDispatchAction = {
  type: 'GENERIC_API_UPDATE_DISPATCH',
  payload: UpdateDispatchPayload,
}

export type RemoveDispatchAction = {
  type: 'GENERIC_API_REMOVE_DISPATCH',
  payload: RemoveDispatchPayload,
}

export type DispatchAction
  = FetchDispatchAction
  | CreateDispatchAction
  | UpdateDispatchAction
  | RemoveDispatchAction

//////////////////////////
// Success Action Types //
//////////////////////////

export type CreateSuccessAction = {
  type: 'GENERIC_API_CREATE_SUCCESS',
  payload: CreateSuccessPayload,
}

export type UpdateSuccessAction = {
  type: 'GENERIC_API_UPDATE_SUCCESS',
  payload: UpdateSuccessPayload,
}

export type FetchSuccessAction = {
  type: 'GENERIC_API_FETCH_SUCCESS',
  payload: FetchSuccessPayload,
}

export type RemoveSuccessAction = {
  type: 'GENERIC_API_REMOVE_SUCCESS',
  payload: RemoveSuccessPayload,
}

export type SuccessAction
  = FetchSuccessAction
  | CreateSuccessAction
  | UpdateSuccessAction
  | RemoveSuccessAction

//////////////////////////
// Failure Action Types //
//////////////////////////

export type CreateFailureAction = {
  type: 'GENERIC_API_CREATE_FAILURE',
  payload: CreateFailurePayload,
}

export type UpdateFailureAction = {
  type: 'GENERIC_API_UPDATE_FAILURE',
  payload: UpdateFailurePayload,
}

export type FetchFailureAction = {
  type: 'GENERIC_API_FETCH_FAILURE',
  payload: FetchFailurePayload,
}

export type RemoveFailureAction = {
  type: 'GENERIC_API_REMOVE_FAILURE',
  payload: RemoveFailurePayload,
}

export type FailureAction
  = FetchFailureAction
  | CreateFailureAction
  | UpdateFailureAction
  | RemoveFailureAction


//////////////////////////
// Other Action Types //
//////////////////////////

export type RequestStartAction = {
  type: 'GENERIC_API_REQUEST_START',
  payload: RequestStartPayload
}

export type Action
  = DispatchAction
  | SuccessAction
  | FailureAction
  | RequestStartAction
