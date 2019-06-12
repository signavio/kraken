// @flow
import { type Action } from './actions'
import { type EntitiesState, type EntityCollectionT } from './entityState'
import { type Request } from './requestState'
import { type ApiTypeMap } from './types'

export type RequestCachePolicyT = (
  apiTypes: ApiTypeMap,
  request: Request,
  collection: EntityCollectionT,
  entityType: string
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
