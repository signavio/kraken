// @flow
const composeSideEffects = (first?: Function, second?: Function) => {
  if (!first && !second) {
    return undefined
  }

  if (!first) {
    return second
  }

  if (!second) {
    return first
  }

  return (stateToReceiveSideEffects, ...args) =>
    first(second(stateToReceiveSideEffects, ...args), ...args)
}

export const compose = (...cachePolicies) =>
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
