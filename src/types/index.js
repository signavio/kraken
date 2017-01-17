// @flow
import { isString, mapValues, isFunction } from 'lodash'
import { Schema as EntitySchema } from 'normalizr'

import type { ApiTypesT, ApiTypeT, MethodT } from '../flowTypes'

// ... while type definitions are accessed through getters
export const getCollection = (types: ApiTypesT, type: string) => {
  const collection = types[type].collection

  if (!isString(collection)) {
    throw new Error(`collection of type: '${type}' must be a string`)
  }

  return collection
}

const createMethodFunctionGetter = (method: MethodT) => (types: ApiTypesT, type: string) => {
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

export const hasEntitySchema = (types: ApiTypesT, type: string): boolean => (
  types[type].schema instanceof EntitySchema
)

export const getIdAttribute = (types: ApiTypesT, type: string) => (
  types[type].schema.getIdAttribute()
)

export const typeConstants = (types: ApiTypesT) => (
  mapValues(types, (val: ApiTypeT, key: string) => key)
)
