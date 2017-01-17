import { combineReducers } from 'redux'
import { mapValues, groupBy } from 'lodash'
import reduceReducers from 'reduce-reducers'

import { typeConstants, getCollection } from '../types'

import createEntitiesReducer from './entityReducer'
import createPromisesReducer from './promiseReducer'

export { createPromisesReducer, createEntitiesReducer }

export default (apiTypes) => {
  const constants = typeConstants(apiTypes)
  const constantsByCollection = groupBy(constants, (constant) => getCollection(apiTypes, constant))

  return combineReducers({

    entities: combineReducers(
      mapValues(
        constantsByCollection,
        (constantsWithSameCollection) => reduceReducers(
          ...constantsWithSameCollection.map(createEntitiesReducer.bind(null, apiTypes))
        )
      )
    ),

    promises: combineReducers(
      mapValues(constants, createPromisesReducer.bind(null, apiTypes))
    ),

  })
}
