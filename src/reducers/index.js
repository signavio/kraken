import { combineReducers } from 'redux'
import { mapValues, groupBy } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { ApiTypeMap } from '../internalTypes'

import { getTypeNames, getCollectionName } from '../types'

import createEntitiesReducer from './entitiesReducer'
import createRequestsReducer from './requestsReducer'

export { createRequestsReducer, createEntitiesReducer }

const createReducer = (apiTypes: ApiTypeMap) => {
  const constants = getTypeNames(apiTypes)
  const constantsByCollection = groupBy(
    constants,
    (constant) => getCollectionName(apiTypes, constant)
  )

  return combineReducers({

    entities: combineReducers(
      mapValues(
        constantsByCollection,
        (constantsWithSameCollection) => reduceReducers(
          ...constantsWithSameCollection.map(createEntitiesReducer.bind(null, apiTypes))
        )
      )
    ),

    requests: combineReducers(
      mapValues(constants, createRequestsReducer.bind(null, apiTypes))
    ),

  })
}

export default createReducer
