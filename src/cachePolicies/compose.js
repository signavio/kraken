// @flow
import type {
  Action,
  ApiTypeMap,
  CachePolicyT,
  EntitiesState,
  EntityCachePolicyT,
  EntityCollectionT,
  Request,
  RequestCachePolicyT,
} from '../internalTypes'

function composeRequestSideEffects(
  first?: RequestCachePolicyT,
  second?: RequestCachePolicyT
): RequestCachePolicyT {
  return (
    apiTypes: ApiTypeMap,
    request: Request,
    collection: EntityCollectionT,
    entityType: string
  ): Request => {
    if (!first && second) {
      return second(apiTypes, request, collection, entityType)
    }

    if (first && !second) {
      return first(apiTypes, request, collection, entityType)
    }

    if (first && second) {
      return first(
        apiTypes,
        second(apiTypes, request, collection, entityType),
        collection,
        entityType
      )
    }

    return request
  }
}

function composeEntitySideEffects(
  first?: EntityCachePolicyT,
  second?: EntityCachePolicyT
): EntityCachePolicyT {
  return (
    apiTypes: ApiTypeMap,
    entities: EntitiesState,
    action: Action
  ): EntitiesState => {
    if (!first && second) {
      return second(apiTypes, entities, action)
    }

    if (first && !second) {
      return first(apiTypes, entities, action)
    }

    if (first && second) {
      return first(apiTypes, second(apiTypes, entities, action), action)
    }

    return entities
  }
}

const compose = (...cachePolicies: Array<CachePolicyT>) =>
  cachePolicies.reduce(
    (combinedPolicy: CachePolicyT, policy: CachePolicyT) => ({
      updateRequestOnCollectionChange: composeRequestSideEffects(
        combinedPolicy.updateRequestOnCollectionChange,
        policy.updateRequestOnCollectionChange
      ),
      updateEntitiesOnAction: composeEntitySideEffects(
        combinedPolicy.updateEntitiesOnAction,
        policy.updateEntitiesOnAction
      ),
    })
  )

export default compose
