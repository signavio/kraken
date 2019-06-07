import { mapValues, startsWith } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import { getCachePolicy } from '../cachePolicies'
import {
  Action,
  ApiTypeMap,
  EntitiesState,
  EntityType,
  RequestsState,
} from '../internalTypes'
import { getCollectionName } from '../types'

const requestsSideEffectsReducer = (
  state: RequestsState,
  apiTypes: ApiTypeMap,
  action: Action,
  collection: EntitiesState,
  entityType: EntityType,
  updateRequestOnCollectionChange
) => {
  const newState = mapValues(state, request =>
    updateRequestOnCollectionChange(apiTypes, request, collection, entityType)
  )

  return shallowEqual(state, newState) ? state : newState
}

const createRequestsSideEffectsReducer = (
  apiTypes: ApiTypeMap,
  entityType: EntityType,
  fullState,
  previousFullState
) => {
  const collectionName = getCollectionName(apiTypes, entityType)
  const collection: EntitiesState = fullState.entities[collectionName]
  const previousCollection =
    previousFullState &&
    previousFullState.entities &&
    previousFullState.entities[collectionName]
  const { updateRequestOnCollectionChange } = getCachePolicy(
    apiTypes,
    entityType
  )

  return (state: State = {}, action: Action) => {
    if (!startsWith(action.type, '@@kraken/')) {
      return state
    }

    if (!updateRequestOnCollectionChange) {
      // type has no requests side effect
      return state
    }

    if (collection === previousCollection) {
      // no update, no side effect
      return state
    }

    return requestsSideEffectsReducer(
      state,
      apiTypes,
      action,
      collection,
      entityType,
      updateRequestOnCollectionChange
    )
  }
}

export default createRequestsSideEffectsReducer
