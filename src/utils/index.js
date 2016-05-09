import findKey from 'lodash/find'
import { getCollection, getPromiseMapper, hasEntitySchema } from '../types'


export const getPromiseState = (state, type, query, types) => {
  const promiseKey = getPromiseMapper(types, type)(query)
  return state.cache.promises[getCollection(types, type)][promiseKey]
}

export const getPromiseValue = (state, type, query, types) => {
  const { value } = getPromiseState(state, type, query) || {}
  const entityCollection = state.cache.entities[getCollection(types, type)]

  if (hasEntitySchema(type)) {
    return value || findKey(entityCollection, query)
  }

  return value
}

export const getEntityState = (state, type, query, types) => {
  const entityCollection = state.cache.entities[getCollection(types, type)]
  const value = getPromiseValue(state, type, query, types)

  if (hasEntitySchema(type)) {
    return value && entityCollection[value]
  }

  return value && value.map(id => entityCollection[id])
}


export const getOutstandingPromises = (state, type, query, types, collection) => {
  const promiseKey = getPromiseMapper(types, type)(query)
  return state.cache.promises[collection][promiseKey]
}
