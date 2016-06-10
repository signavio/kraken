import { combineReducers } from 'redux'
import mapValues from 'lodash/mapValues'
import groupBy from 'lodash/groupBy'
import reduceReducers from 'reduce-reducers'

import invariant from 'invariant'

import { typeConstants, getCollection } from '../types'
import { deriveRequestIdFromAction } from '../utils'
import {
  LOAD_ENTITY,
  CACHE_HIT,
  CREATE_ENTITY,
  UPDATE_ENTITY,
  REMOVE_ENTITY,
  REQUEST,
  SUCCESS,
  FAILURE,
} from '../actions'

export const createEntitiesReducer = (apiTypes, typeConstant) => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== typeConstant) return state

  switch (action.type) {
    case SUCCESS:
      const entities = payload.entities[getCollection(apiTypes, typeConstant)]
      return entities ? {
        ...state,
        ...entities,
      } : state
    default:
      return state
  }
}


export const createPromisesReducer = (apiTypes, typeConstant) => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== typeConstant) return state

  const key = deriveRequestIdFromAction(apiTypes, action)
  const promise = state[key]

  switch (action.type) {
    case LOAD_ENTITY:
    case CREATE_ENTITY:
    case UPDATE_ENTITY:
    case REMOVE_ENTITY:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: true,
          pending: true,
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
    case REQUEST:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: false,
          ...(promise && promise.fulfilled && { refreshing: true }),
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
  const constants = typeConstants(apiTypes)
  const constantsByCollection = groupBy(constants, constant => getCollection(apiTypes, constant))

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
