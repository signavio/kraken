import findKey from 'lodash/find'
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

export const deriveRequestIdFromAction = (types, { type, payload }) => {
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

export const getEntityState = (types, state, type, method, payload) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const { value } = getPromiseState(types, state, type, method, payload) || {}
  const { query } = payload

  if (hasEntitySchema(types, type)) {
    // single item type: if there's no promise, try to retrieve from cache
    const id = value || findKey(entityCollection, query)
    return id && entityCollection[id]
  }

  // array type: map ids in promise value to entities
  return value && value.map(id => entityCollection[id])
}
