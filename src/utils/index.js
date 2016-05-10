import findKey from 'lodash/find'
import { getCollection, stringifyQuery, hasEntitySchema } from '../types'


export const getPromiseState = (state, type, query) => {
  const promiseKey = stringifyQuery(query)
  return state.cache.promises[type][promiseKey]
}

export const getPromiseValue = (state, type, query, types) => {
  const { value } = getPromiseState(state, type, query) || {}
  const entityCollection = state.cache.entities[getCollection(types, type)]

  if (hasEntitySchema(types, type)) {
    return value || findKey(entityCollection, query)
  }

  return value
}

export const getEntityState = (state, type, query, types) => {
  const entityCollection = state.cache.entities[getCollection(types, type)]
  const value = getPromiseValue(state, type, query, types)

  if (hasEntitySchema(types, type)) {
    return value && entityCollection[value]
  }

  return value && value.map(id => entityCollection[id])
}
