import { combineReducers } from 'redux'
import mapValues from 'lodash/mapValues'
import groupBy from 'lodash/groupBy'
import reduceReducers from 'reduce-reducers'

import { getPromiseMapper, getCollection } from '../types'
import { actionTypes } from '../actions'

const {
  LOAD_ENTITY,
  CACHE_HIT,
  REQUEST,
  SUCCESS,
  FAILURE,
} = actionTypes

export const createEntitiesReducer = types => type => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== type) return state

  switch (action.type) {
    case SUCCESS:
      const entities = payload.entities[getCollection(types, type)]
      return entities ? {
        ...state,
        ...entities,
      } : state
    default:
      return state
  }
}


export const createPromisesReducer = types => type => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== type) return state
  const key = getPromiseMapper(types, type)(payload.query)
  const promise = state[key]

  switch (action.type) {
    case LOAD_ENTITY:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: true,
          pending: true,
        },
      }
    case REQUEST:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: false,
          ...(promise && promise.fulfilled && { refreshing: true }),
        },
      }
    case CACHE_HIT:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: false,
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
        },
      }
    case SUCCESS:
      return {
        ...state,
        [key]: {
          ...promise,
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
        },
      }
    case FAILURE:
      return {
        ...state,
        [key]: {
          ...promise,
          pending: false,
          fulfilled: false,
          rejected: true,
          reason: payload.error,
        },
      }
    default:
      return state
  }
}


export default (apiTypes) => {
  const typesGroupedByCollection = groupBy(apiTypes, (apiType) => apiType.collection)
  return combineReducers({

    entities: combineReducers(
      mapValues(typesGroupedByCollection,
        types => reduceReducers(...types.map(createEntitiesReducer(types)))
      )
    ),

    promises: combineReducers(
      mapValues(typesGroupedByCollection,
        types => reduceReducers(...types.map(createPromisesReducer(types)))
      )
    ),
  })
}
