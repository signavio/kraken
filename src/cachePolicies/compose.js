// @flow
import type {
  CachePolicyT,
  EntitiesState,
  EntityCachePolicyT,
  RequestCachePolicyT,
  RequestsState,
} from '../internalTypes'

type PolicyT = EntityCachePolicyT | RequestCachePolicyT

const composeSideEffects = (first?: PolicyT, second?: PolicyT) => {
  return (
    stateToReceiveSideEffects: RequestsState | EntitiesState,
    ...args
  ) => {
    if (!first && second) {
      return second(stateToReceiveSideEffects, ...args)
    }

    if (first && !second) {
      return first(stateToReceiveSideEffects, ...args)
    }

    if (first && second) {
      return first(second(stateToReceiveSideEffects, ...args), ...args)
    }

    return stateToReceiveSideEffects
  }
}

const compose = (...cachePolicies: Array<CachePolicyT>) =>
  cachePolicies.reduce(
    (combinedPolicy: CachePolicyT, policy: CachePolicyT) => ({
      updateRequestOnCollectionChange: composeSideEffects(
        combinedPolicy.updateRequestOnCollectionChange,
        policy.updateRequestOnCollectionChange
      ),
      updateEntitiesOnAction: composeSideEffects(
        combinedPolicy.updateEntitiesOnAction,
        policy.updateEntitiesOnAction
      ),
    })
  )

export default compose
