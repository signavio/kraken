// @flow
import { keys, intersection, mapValues, omit, groupBy } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import { actionTypes } from './actions'
import { isMatch, removeReferences } from './utils'
import { getCollectionName, getTypeNames } from './types'

import type { Action, ApiTypeMap, Entity, EntitiesState } from './internalTypes'

// ENTITIES SIDE EFFECTS

const removeReferencesFromAllInCollection = (
  collection: Entity,
  responsibleSchemas: Array<Object>,
  schemaOfRemovedEntities: Object,
  idsToRemove: Array<string>
): Entity => {
  const newCollectionState = mapValues(collection, (entityState: Entity) =>
    removeReferences(
      entityState,
      responsibleSchemas,
      schemaOfRemovedEntities,
      idsToRemove
    )
  )

  return shallowEqual(newCollectionState, collection)
    ? collection
    : newCollectionState
}

const deleteOnMatchingRemoveDispatch = (
  apiTypes: ApiTypeMap,
  entities: EntitiesState,
  action: Action
): EntitiesState => {
  if (action.type !== actionTypes.REMOVE_DISPATCH) {
    return entities
  }

  const { query, entityType: actionTypeConstant } = action.payload
  const collectionName = getCollectionName(apiTypes, actionTypeConstant)
  const idsToRemove = [
    ...keys(entities[collectionName]).filter((key: string) =>
      isMatch(entities[collectionName][key], query)
    ),
  ]

  if (idsToRemove.length === 0) {
    return entities
  }

  const schemaOfRemovedEntities = apiTypes[actionTypeConstant].schema

  const constants = getTypeNames(apiTypes)
  const constantsByCollection = groupBy(constants, (constant: string) =>
    getCollectionName(apiTypes, constant)
  )

  const collectionsWithCleanedReferences = mapValues(
    constantsByCollection,
    (
      constantsWithSameCollection: Array<string>,
      collectionNameOfAllTheseTypes: string
    ) =>
      removeReferencesFromAllInCollection(
        entities[collectionNameOfAllTheseTypes],
        constantsWithSameCollection.map(
          (constant: string) => apiTypes[constant].schema
        ),
        schemaOfRemovedEntities,
        idsToRemove
      )
  )

  return {
    ...collectionsWithCleanedReferences,
    [collectionName]: omit(
      collectionsWithCleanedReferences[collectionName],
      idsToRemove
    ),
  }
}

// REQUESTS SIDE EFFECTS

// clean result values from ids that are no longer existent in the cache
const removeDeleted = (request, collection) => {
  if (!request.value) {
    return request
  }
  const existingIds = intersection(request.value, keys(collection))
  return existingIds.length === request.value.length
    ? request
    : {
        ...request,
        value: existingIds,
      }
}

// match cached entities' properties with query params and keep the result up-to-date with cache
const selectMatchingItemsAsValue = (request, collection) => {
  const matchingIds = keys(collection).filter(id =>
    isMatch(collection[id], request.query)
  )

  if (!request.value) {
    return {
      ...request,
      value: matchingIds,
    }
  }

  return shallowEqual(matchingIds, request.value || [])
    ? request
    : {
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
  updateEntitiesOnAction: deleteOnMatchingRemoveDispatch,
}

// CACHE POLICY COMPOSITION UTIL

const composeSideEffects = (first, second) => {
  if (!first && !second) return undefined
  if (!first) return second
  if (!second) return first
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
