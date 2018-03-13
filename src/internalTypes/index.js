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

  result: EntityId | Array<EntityId> | null,

  validUntil: number,
  refresh: any,
}

export type RequestCollectionT = {
  [requestId: string]: Request,
}

export type RequestsState = {
  [entityType: string]: RequestCollectionT,
}

export type EntityCollectionT = {
  [entityId: string]: Entity,
}

export type EntitiesState = {
  [collection: string]: EntityCollectionT,
}

export type PromiseProp<T> = {
  pending: boolean,
  fulfilled: boolean,
  rejected: boolean,

  reason?: string,

  value: ?T,
}

export type State = {
  kraken: {
    requests: RequestsState,
    entities: EntitiesState,
  },
}

export type normalizrResult =
  | { response: { result: any, entities: any } }
  | { error: any }

export type ApiType = {
  collection: string,
  schema: schema.Entity,

  fetch?: any => normalizrResult,
  create?: any => normalizrResult,
  remove?: any => normalizrResult,
  update?: any => normalizrResult,
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

export type DispatchPayload = {
  query: Query,
  body: Body,
  elementId: string,
  entityType: string,
}

///////////////////////////
// Success Payload Types //
///////////////////////////

export type CreateSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | Array<EntityId>,
  entities: Array<Entity>,
}

export type UpdateSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | Array<EntityId>,
  entities: Array<Entity>,
}

export type FetchSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | Array<EntityId>,
  entities: Array<Entity>,
  isCachedResponse: boolean,
}

export type RemoveSuccessPayload = {
  requestId: RequestId,
  entityType: string,
  result: EntityId | Array<EntityId>,
  entities: Array<Entity>,
}

export type SuccessPayload =
  | CreateSuccessPayload
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

export type FailurePayload =
  | CreateFailurePayload
  | UpdateFailurePayload
  | FetchFailurePayload
  | RemoveFailurePayload

export type RequestStartPayload = {
  entityType: string,
  requestId: RequestId,
}

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

export type CachePolicyT = {
  updateRequestOnCollectionChange?: (
    request: Request,
    collection: EntityCollectionT
  ) => Request,
  updateEntitiesOnAction?: (
    apiTypes: ApiTypeMap,
    entities: EntitiesState,
    action: Action
  ) => EntitiesState,
}
