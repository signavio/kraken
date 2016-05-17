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

const createMethodFunctionGetter = method => (types, type) => {
  const methodFn = types[type][method]
  if (!isFunction(methodFn)) {
    throw new Error(`Implementation of '${type}' type does not provide a ${method} function`)
  }
  return methodFn
}

export const getFetch = createMethodFunctionGetter('fetch')
export const getCreate = createMethodFunctionGetter('create')
export const getUpdate = createMethodFunctionGetter('update')
export const getRemove = createMethodFunctionGetter('remove')

export const hasEntitySchema = (types, type) => types[type].schema instanceof EntitySchema

export const getIdAttribute = (types, type) => types[type].schema.getIdAttribute()

export const typeConstants = (types) => mapValues(types, (val, key) => key)
