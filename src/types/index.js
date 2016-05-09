import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import { Schema as EntitySchema } from 'normalizr'

// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with differnet key sets are used for the same type
const stringifyQuery = (query) => JSON.stringify(query)

const createDefaultPromiseMapper = (type) => (query) => `${type}_${stringifyQuery(query)}`

// ... while type definitions are accessed through getters
export const getCollection = (types, type) => {
  const collection = types[type].collection
  if (!isString(collection)) throw new Error(`collection of type: '${type}' must be a string`)
  return collection
}

export const getFetch = (types, type) => {
  const fetch = types[type].fetch
  if (!isFunction(fetch)) throw new Error(`fetch of type: '${type}' must be a function`)
  return fetch
}

export const getPromiseMapper = (types, type) => {
  return types[type].mapPromise || createDefaultPromiseMapper(type)
}

export const hasEntitySchema = (types, type) => types[type].schema instanceof EntitySchema

export const getIdAttribute = (types, type) => types[type].schema.getIdAttribute()
