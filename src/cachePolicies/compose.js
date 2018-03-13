// @flow
import type { CachePolicyT } from '../internalTypes'

const composeSideEffects = (first?: Function, second?: Function) => {
  if (first && second) {
    return (stateToReceiveSideEffects, ...args) =>
      first(second(stateToReceiveSideEffects, ...args), ...args)
  }

  if (!first) {
    return second
  }

  if (!second) {
    return first
  }
}

export const compose = (...cachePolicies: Array<CachePolicyT>) =>
  cachePolicies.reduce((combinedPolicy, policy) => ({
    updateRequestOnCollectionChange: composeSideEffects(
      combinedPolicy.updateRequestOnCollectionChange,
      policy.updateRequestOnCollectionChange
    ),
    updateEntitiesOnAction: composeSideEffects(
      combinedPolicy.updateEntitiesOnAction,
      policy.updateEntitiesOnAction
    ),
  }))
