import findKey from 'lodash/find'
import { getCollection, hasEntitySchema, getIdAttribute } from '../types'
import { LOAD_ENTITY, CACHE_HIT, CREATE_ENTITY, UPDATE_ENTITY, REMOVE_ENTITY } from '../actions'


// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with different key sets are used for the same type
const stringifyQuery = (query) => JSON.stringify(query)

export derivePromiseKey = (method, { query, elementId }) => {
  const key = elementId || stringifyQuery(query)
  return `${method}_${elementId}`
}

const methodForAction = ({ type }) => ({
  LOAD_ENTITY: 'fetch',
  CACHE_HIT: 'fetch',
  CREATE_ENTITY: 'create',
  UPDATE_ENTITY: 'update',
  REMOVE_ENTITY: 'remove',
}[type])

export const derivePromiseKeyFromAction = (types, action) => {
  const { type, payload: { requestId } } = action
  return requestId || derivePromiseKey(methodForAction(action), payload)
}

export const getPromiseState = (types, state, type, method, payload) => {
  const promiseKey = derivePromiseKey(method, payload)
  return state.cache.promises[type][promiseKey]
}

export const getPromiseValue = (types, state, type, method, payload) => {
  const { value } = getPromiseState(types, state, type, method, payload) || {}
  const entityCollection = state.cache.entities[getCollection(types, type)]

  if (hasEntitySchema(types, type)) {
    return value || findKey(entityCollection, query)
  }

  return value
}

const getEntityCollectionState = (types, state, type) => state.cache.entities[getCollection(types, type)]

export const getEntityState = (types, state, type, query) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const value = getPromiseValue(types, state, type, query)

  if (hasEntitySchema(types, type)) {
    return value && entityCollection[value]
  }

  return value && value.map(id => entityCollection[id])
}
