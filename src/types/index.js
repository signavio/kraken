import isString from 'lodash/isString'
import mapValues from 'lodash/mapValues'
import isFunction from 'lodash/isFunction'
import { Schema as EntitySchema } from 'normalizr'

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

// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with differnet key sets are used for the same type
export const stringifyQuery = (query) => JSON.stringify(query)

export const hasEntitySchema = (types, type) => types[type].schema instanceof EntitySchema

export const getIdAttribute = (types, type) => types[type].schema.getIdAttribute()

export const simplifyTypes = (types) => mapValues(types, (val, key) => key)
