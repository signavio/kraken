// @flow
import { type Action } from './actions'
import {
  type ApiTypeMap,
  type EntitiesState,
  type EntityCollectionT,
} from './founddation'

export type RequestCachePolicyT = (
  request: Request,
  collection: EntityCollectionT
) => Request

export type EntityCachePolicyT = (
  apiTypes: ApiTypeMap,
  entities: EntitiesState,
  action: Action
) => EntitiesState

export type CachePolicyT = {
  updateRequestOnCollectionChange?: RequestCachePolicyT,
  updateEntitiesOnAction?: EntityCachePolicyT,
}
