// @flow

import { type EntitiesState, type RequestsState } from './founddation'

export * from './promiseProps'
export * from './founddation'

export type EntityId = string
export type RequestId = string

export type Entity = any
export type EntityType = string

export type KrakenState = {
  requests: RequestsState,
  entities: EntitiesState,
}

export type State = {
  kraken: KrakenState,
}

export type MethodName = 'create' | 'fetch' | 'remove' | 'update'

export type StateGetter = () => State
