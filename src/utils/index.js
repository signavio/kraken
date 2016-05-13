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

export const getEntityCollectionState = (state, type) => state.cache.entities[getCollection(type)]

export const getEntityState = (state, type, query, types) => {
  const entityCollection = getEntityCollectionState(state, type)
  const value = getPromiseValue(state, type, query)

  if(hasEntitySchema(type)) {
    return value && entityCollection[value]
  } else {
    return value && value.map(id => entityCollection[id])
  }
}