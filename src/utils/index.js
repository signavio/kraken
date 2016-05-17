import findKey from 'lodash/find'
import { getCollection, hasEntitySchema, getIdAttribute } from '../types'
import { LOAD_ENTITY, CREATE_ENTITY, UPDATE_ENTITY, REMOVE_ENTITY } from '../actions'


// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with different key sets are used for the same type
export const stringifyQuery = (query) => JSON.stringify(query)

export const deriveRequestId = (types, action) => {
  const { type, payload } = action
  switch (type) {
    case LOAD_ENTITY:
      return stringifyQuery(payload.query)
    case CREATE_ENTITY:
      return payload.requestId
    case UPDATE_ENTITY:
      const id = payload.body[getIdAttribute(types[payload.entity])]
      return `update_${id}`
    case REMOVE_ENTITY:
      return `remove_${payload.id}`
    default:
      return payload.requestId
  }

}

export const getPromiseState = (types, state, type, query) => {
  const promiseKey = stringifyQuery(query)
  return state.cache.promises[type][promiseKey]
}

export const getPromiseValue = (types, state, type, query) => {
  const { value } = getPromiseState(types, state, type, query) || {}
  const entityCollection = state.cache.entities[getCollection(types, type)]

  if (hasEntitySchema(types, type)) {
    return value || findKey(entityCollection, query)
  }

  return value
}

export const getEntityCollectionState = (types, state, type) => state.cache.entities[getCollection(types, type)]

export const getEntityState = (types, state, type, query) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const value = getPromiseValue(types, state, type, query)

  if (hasEntitySchema(types, type)) {
    return value && entityCollection[value]
  }

  return value && value.map(id => entityCollection[id])
}
