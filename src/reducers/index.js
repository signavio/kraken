import { combineReducers } from 'redux'
import { mapValues, groupBy } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { ApiTypeMap } from '../flowTypes'

import { getTypeNames, getCollectionName } from '../types'

import createEntitiesReducer from './entitiesReducer'
import createRequestsReducer from './requestsReducer'
import createEnhanceWithSideEffects from './enhanceWithSideEffects'
import createWipeReducer from './wipeReducer'

export { createRequestsReducer, createEntitiesReducer, createWipeReducer }

const createReducer = (apiTypes: ApiTypeMap) => {
  const constants = getTypeNames(apiTypes)
  const constantsByCollection = groupBy(constants, (constant) =>
    getCollectionName(apiTypes, constant)
  )
  const enhanceWithSideEffects = createEnhanceWithSideEffects(apiTypes)

  const apiReducer = enhanceWithSideEffects(
    combineReducers({
      entities: combineReducers(
        mapValues(constantsByCollection, (constantsWithSameCollection) =>
          reduceReducers(
            ...constantsWithSameCollection.map((typeConstant) =>
              createEntitiesReducer(apiTypes, typeConstant)
            )
          )
        )
      ),

      requests: combineReducers(
        mapValues(constants, (typeConstant) =>
          createRequestsReducer(apiTypes, typeConstant)
        )
      ),
    })
  )

  const wipeReducer = (state, action) => createWipeReducer(state, action)

  return reduceReducers(wipeReducer, apiReducer)
}

export default createReducer
