import { mapValues } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import { ApiTypeMap, RequestsState, Action } from '../internalTypes'

import { deriveRequestIdFromAction } from '../utils'
import { getCollectionName, getCachePolicy } from '../types'
import { actionTypes } from '../actions'

const requestsSideEffectsReducer = (state: RequestsState, action: Action, collection, updateRequestOnCollectionChange) => {
  const newState = mapValues(
    state,
    (request) => updateRequestOnCollectionChange(request, collection)
  )

  return shallowEqual(state, newState) ? state : newState
}

const createRequestsSideEffectsReducer = (apiTypes: ApiTypeMap, typeConstant, fullState, previousFullState) => {
  const collectionName = getCollectionName(apiTypes, typeConstant)
  const collection = fullState.entities[collectionName]
  const previousCollection = previousFullState && previousFullState.entities &&
    previousFullState.entities[collectionName]
  const { updateRequestOnCollectionChange } = getCachePolicy(apiTypes, typeConstant)

  return (state: State = {}, action: Action) => {
    if (!updateRequestOnCollectionChange) {
      // type has no requests side effect
      return state
    }

    if (collection === previousCollection) {
      // no update, no side effect
      return state
    }

    return requestsSideEffectsReducer(state, action, collection, updateRequestOnCollectionChange)
  }
}

export default createRequestsSideEffectsReducer
