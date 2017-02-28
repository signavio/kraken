import { combineReducers } from 'redux'
import { mapValues, groupBy } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { getTypeNames, getCollectionName } from '../types'
import createEntitiesSideEffectsReducer from './entitiesSideEffectsReducer'
import createRequestsSideEffectsReducer from './requestsSideEffectsReducer'

const createEnhanceWithSideEffects = (apiTypes: ApiTypeMap) => {
  const constants = getTypeNames(apiTypes)
  const constantsByCollection = groupBy(
    constants,
    (constant) => getCollectionName(apiTypes, constant)
  )

  const combinedEntitiesSideEffectsReducer = combineReducers(
    mapValues(
      constantsByCollection,
      (constantsWithSameCollection) => reduceReducers(
        ...constantsWithSameCollection.map(
          (typeConstant) => createEntitiesSideEffectsReducer(apiTypes, typeConstant)
        )
      )
    )
  )


  const enhanceWithSideEffects = (reducer) => (state, action) => {
    const originalState = state
    // first apply the wrapped reducer
    const updatedState = reducer(state, action)
    // then apply the entities side effects reducers
    const entities = combinedEntitiesSideEffectsReducer(updatedState.entities, action)
    const updatedStateWithEntitiesSideEffects = entities === updatedState.entities ?
      updatedState : { ...updatedState, entities }

    // finally, apply the requests side effects reducers, which depend on the updated entities state
    const combinedRequestsSideEffectsReducer = combineReducers(
      mapValues(
        constants,
        (typeConstant) => createRequestsSideEffectsReducer(
          apiTypes, typeConstant, updatedStateWithEntitiesSideEffects, originalState
        )
      )
    )
    const requests = combinedRequestsSideEffectsReducer(
      updatedStateWithEntitiesSideEffects.requests,
      action
    )
    return requests === updatedStateWithEntitiesSideEffects.requests ?
      updatedStateWithEntitiesSideEffects :
      {
        ...updatedStateWithEntitiesSideEffects,
        requests
      }
  }

  return enhanceWithSideEffects
}

export default createEnhanceWithSideEffects
