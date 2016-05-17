import findKey from 'lodash/find'
import { getCollection, stringifyQuery, hasEntitySchema } from '../types'


export const getPromiseState = (state, type, query) => {
  const promiseKey = stringifyQuery(query)
  console.log("l", state);
  return state.cache.promises[type][promiseKey]
}

export const getPromiseValue = (types, state, type, query) => {
  const { value } = getPromiseState(state, type, query) || {}
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
