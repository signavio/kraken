import { groupBy, mapValues } from 'lodash'
import reduceReducers from 'reduce-reducers'
import { combineReducers } from 'redux'

import { ApiTypeMap } from '../flowTypes'
import { getCollectionName, getTypeNames } from '../types'
import createEnhanceWithSideEffects from './enhanceWithSideEffects'
import createEntitiesReducer from './entitiesReducer'
import metaDataReducer from './metaDataReducer'
import createRequestsReducer from './requestsReducer'
import wipeReducer from './wipeReducer'

export {
  createRequestsReducer,
  createEntitiesReducer,
  wipeReducer,
  metaDataReducer,
}

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

  return reduceReducers(wipeReducer, apiReducer)
}

export default createReducer
