// @flow

import { type EntitiesState } from './entityState'
import { type RequestsState } from './requestState'

export * from './promiseProps'
export * from './api'
export * from './entityState'
export * from './requestState'
export * from './types'
export * from './actions'
export * from './cachePolicies'

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
