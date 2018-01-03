import { combineReducers } from 'redux'
import { mapValues, keys, isFunction } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { getTypeNames } from '../types'
import createEntitiesSideEffectsReducer from './entitiesSideEffectsReducer'
import createRequestsSideEffectsReducer from './requestsSideEffectsReducer'

import type { ApiTypeMap } from '../internalTypes'

const createEnhanceWithSideEffects = (apiTypes: ApiTypeMap) => {
  const constants = getTypeNames(apiTypes)

  const combinedEntitiesSideEffectsReducer = reduceReducers(
    ...keys(apiTypes)
      .map((typeConstant: string) =>
        createEntitiesSideEffectsReducer(apiTypes, typeConstant)
      )
      .filter(isFunction)
  )

  const enhanceWithSideEffects = (reducer: Function) => (state, action) => {
    const originalState = state

    // first apply the wrapped reducer
    const updatedState = reducer(state, action)

    // then apply the entities side effects reducers
    const entities = combinedEntitiesSideEffectsReducer(
      updatedState.entities,
      action
    )

    const updatedStateWithEntitiesSideEffects =
      entities === updatedState.entities
        ? updatedState
        : {
            ...updatedState,
            entities,
          }

    // finally, apply the requests side effects reducers, which depend on the updated entities state
    const combinedRequestsSideEffectsReducer = combineReducers(
      mapValues(constants, (typeConstant: string) =>
        createRequestsSideEffectsReducer(
          apiTypes,
          typeConstant,
          updatedStateWithEntitiesSideEffects,
          originalState
        )
      )
    )
    const requests = combinedRequestsSideEffectsReducer(
      updatedStateWithEntitiesSideEffects.requests,
      action
    )
    return requests === updatedStateWithEntitiesSideEffects.requests
      ? updatedStateWithEntitiesSideEffects
      : {
          ...updatedStateWithEntitiesSideEffects,
          requests,
        }
  }

  return enhanceWithSideEffects
}

export default createEnhanceWithSideEffects
