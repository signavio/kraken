// @flow

import { type EntitiesState } from './entityState'
import { type MetaData } from './metaData'
import { type RequestsState } from './requestState'

export * from './promiseProps'
export * from './api'
export * from './entityState'
export * from './requestState'
export * from './types'
export * from './actions'
export * from './cachePolicies'
export * from './metaData'

export type EntityId = string
export type RequestId = string

export type Entity = any
export type EntityType = string

export type KrakenState = {
  requests: RequestsState,
  entities: EntitiesState,
  meta: MetaData,
}

export type State = {
  kraken: KrakenState,
}

export type MethodName = 'create' | 'fetch' | 'remove' | 'update'

export type StateGetter = () => State
