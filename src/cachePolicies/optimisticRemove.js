// @flow
import { omit, groupBy, mapValues, keys } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import { actionTypes } from '../actions'
import { getCollectionName, getTypeNames } from '../types'
import { removeReferences, isMatch } from '../utils'
import type { Action, ApiTypeMap, EntitiesState, Entity } from '../flowTypes'

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

export default {
  updateEntitiesOnAction: deleteOnMatchingRemoveDispatch,
}
