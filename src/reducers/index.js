import { combineReducers } from 'redux'
import mapValues from 'lodash/mapValues'
import groupBy from 'lodash/groupBy'
import reduceReducers from 'reduce-reducers'

import invariant from 'invariant'

import { typeConstants } from '../types'
import { deriveRequestId } from '../utils'
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

export const createEntitiesReducer = type => (state = {}, action) => {
  invariant(
    !!type.key,
    `type.key must be set.`
  )
  const { payload = {} } = action
  if (payload.entity !== type.key) return state

  switch (action.type) {
    case SUCCESS:
      const entities = payload.entities[type.collection]
      return entities ? {
        ...state,
        ...entities,
      } : state
    default:
      return state
  }
}


export const createPromisesReducer = (apiTypes, type) => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== type) return state

  const key = deriveRequestId(apiTypes, action)
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
  const typesGroupedByCollection = groupBy( apiTypes, (apiType) => apiType.collection )
  return combineReducers({

    entities: combineReducers(
      mapValues(
        typesGroupedByCollection,
        types => reduceReducers(
          ...types.map(createEntitiesReducer)
        )
      )
    ),

    promises: combineReducers(
      mapValues(typeConstants(apiTypes), createPromisesReducer.bind(null, apiTypes))
    ),

  })
}
