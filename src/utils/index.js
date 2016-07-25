import { findKey, isPlainObject } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'
import { getCollection, hasEntitySchema } from '../types'
import { FETCH_ENTITY, CACHE_HIT, CREATE_ENTITY, UPDATE_ENTITY, REMOVE_ENTITY } from '../actions'


// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with different key sets are used for the same type
const stringifyQuery = (query) => JSON.stringify(query)

export const deriveRequestId = (method, { query, elementId, propName }) => {
  return method === 'create' ?
    `create_${elementId}_${propName}` :
    `${method}_${stringifyQuery(query)}`
}

const methodForActionType = (type) => ({
  [FETCH_ENTITY]: 'fetch',
  [CACHE_HIT]: 'fetch',
  [CREATE_ENTITY]: 'create',
  [UPDATE_ENTITY]: 'update',
  [REMOVE_ENTITY]: 'remove',
}[type])

export const deriveRequestIdFromAction = ({ type, payload = {} }) => {
  const { requestId } = payload
  return requestId || deriveRequestId(methodForActionType(type), payload)
}

export const getPromiseState = (types, state, type, method, payload) => {
  const requestId = deriveRequestId(method, payload)
  return state.cache.promises[type][requestId]
}

const getEntityCollectionState = (types, state, type) => (
  state.cache.entities[getCollection(types, type)]
)

export const getCachedValue = (types, state, type, method, payload) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const { value } = getPromiseState(types, state, type, method, payload) || {}
  const { query } = payload

  if (hasEntitySchema(types, type)) {
    // single item type: if there's no promise, try to retrieve from cache
    return value || findKey(entityCollection, query)
  }

  return value
}

export const getEntityState = (types, state, type, method, payload) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const value = getCachedValue(types, state, type, method, payload)

  if (hasEntitySchema(types, type)) {
    return value && entityCollection[value]
  }

  // array type: map ids in promise value to entities
  return value && value.map(id => entityCollection[id])
}

export const promisePropsEqual = (
  { query: query1, requiredFields: requiredFields1, ...rest1 }, 
  { query: query2, requiredFields: requiredFields2, ...rest2 }
) => (
  (
    query1 === query2 || 
    (isPlainObject(query1) && isPlainObject(query2) && shallowEqual(query1, query2))
  ) &&
  ( 
    requiredFields1 === requiredFields2 || 
    shallowEqual(requiredFields1, requiredFields2)
  ) && 
  shallowEqual(rest1, rest2)
)
