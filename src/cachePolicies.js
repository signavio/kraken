import { keys, isMatch, intersection } from 'lodash'

import { actionTypes } from './actions'

// ENTITIES SIDE EFFECTS

const deleteOnMatchingRemoveDispatch = (entity, { type, payload }) => {
  if (type === actionTypes.REMOVE_DISPATCH && isMatch(entity, payload.query)) {
    // falsy values will be filtered out
    return undefined
  }

  return entity
}

// REQUESTS SIDE EFFECTS

// clean result values from ids that are no longer existent in the cache
const removeDeleted = (request, collection) => {
  if (!request.value) {
    return request
  }
  const existingIds = intersection(request.value, keys(collection))
  return existingIds.length === request.value.length ? request : {
    ...request,
    value: existingIds,
  }
}

// match cached entities' properties with query params and keep the result up-to-date with cache
const selectMatchingItemsAsValue = (request, collection) => {
  const matchingIds = keys(collection).filter((id) => isMatch(collection[id], request.query))
  return matchingIds.length === request.value.length ? request : {
    ...request,
    value: matchingIds,
  }
}

// CACHE POLICIES

export const removeReferencesToDeletedEntities = {
  updateRequestOnCollectionChange: removeDeleted,
}

export const queryFromCache = {
  updateRequestOnCollectionChange: selectMatchingItemsAsValue,
}

export const optimisticRemove = {
  updateEntityOnAction: deleteOnMatchingRemoveDispatch,
}

// CACHE POLICY COMPOSITION UTIL

const composeSideEffects = (first, second) => {
  if (!first && !second) return undefined
  if (!first) return second
  if (!second) return first
  return (stateToReceiveSideEffects, ...args) => (
    first(second(stateToReceiveSideEffects, ...args), ...args)
  )
}

export const compose = (...cachePolicies) => (
  cachePolicies.reduce((combinedPolicy, policy) => ({
    updateRequestOnCollectionChange: composeSideEffects(
      combinedPolicy.updateRequestOnCollectionChange,
      policy.updateRequestOnCollectionChange
    ),
    updateEntityOnAction: composeSideEffects(
      combinedPolicy.updateEntityOnAction,
      policy.updateEntityOnAction
    ),
  }))
)