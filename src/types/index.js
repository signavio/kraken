import { isString, mapValues, isFunction } from 'lodash'
import { schema } from 'normalizr'

import { ApiType, ApiTypeMap, MethodName, EntityType } from '../internalTypes'
import { optimisticRemove, removeReferencesToDeletedEntities } from '../cachePolicies'

export const getCollectionName = (types: ApiTypeMap, entityType: EntityType) => {
  const collection = types[entityType].collection

  if (!isString(collection)) {
    throw new Error(`collection of type: '${entityType}' must be a string`)
  }

  return collection
}

const createMethodFunctionGetter = (methodName: MethodName) => (types: ApiTypeMap, entityType: EntityType) => {
  const method = types[entityType][methodName]

  if (!isFunction(method)) {
    throw new Error(`Implementation of '${entityType}' type does not provide a ${methodName} function.`)
  }

  return method
}

export const getFetch  = createMethodFunctionGetter('fetch')
export const getCreate = createMethodFunctionGetter('create')
export const getUpdate = createMethodFunctionGetter('update')
export const getRemove = createMethodFunctionGetter('remove')

export const hasEntitySchema = (types: ApiTypeMap, entityType: EntityType): boolean => (
  types[entityType].schema instanceof schema.Entity
)

// Temporary workaround: normalizr 3.x has dropped getIdAttribute
export const getIdAttribute = (types: ApiTypeMap, entityType: EntityType) => 'id'
// export const getIdAttribute = (types: ApiTypes, entityType: EntityType) => types[entityType].schema.getIdAttribute()

export const getTypeNames = (types: ApiTypeMap) => (
  mapValues(types, (value: ApiType, name: string) => name)
)


const defaultEntityCachePolicy = optimisticRemove
const defaultArrayCachePolicy = removeReferencesToDeletedEntities

export const getCachePolicy = (types: ApiTypeMap, entityType: EntityType) => (
  types[entityType].cachePolicy ||
  (hasEntitySchema(types, entityType) ? defaultEntityCachePolicy : defaultArrayCachePolicy)
)