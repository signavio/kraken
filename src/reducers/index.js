import { combineReducers } from 'redux'
import { mapValues, groupBy } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { ApiTypeMap } from '../internalTypes'

import { getTypeNames, getCollectionName } from '../types'

import createEntitiesReducer from './entitiesReducer'
import createRequestsReducer from './requestsReducer'
import createEnhanceWithSideEffects from './enhanceWithSideEffects'

export { createRequestsReducer, createEntitiesReducer }

const createReducer = (apiTypes: ApiTypeMap) => {
  const constants = getTypeNames(apiTypes)
  const constantsByCollection = groupBy(
    constants,
    (constant) => getCollectionName(apiTypes, constant)
  )
  const enhanceWithSideEffects = createEnhanceWithSideEffects(apiTypes)

  return enhanceWithSideEffects(
    combineReducers({

      entities: combineReducers(
        mapValues(
          constantsByCollection,
          (constantsWithSameCollection) => reduceReducers(
            ...constantsWithSameCollection.map(
              (typeConstant) => createEntitiesReducer(apiTypes, typeConstant)
            )
          )
        )
      ),

      requests: combineReducers(
        mapValues(constants, (typeConstant) => createRequestsReducer(apiTypes, typeConstant))
      ),

    })
  )
}

export default createReducer
