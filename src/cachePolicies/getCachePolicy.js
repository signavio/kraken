// @flow
import { type ApiTypeMap, type EntityType } from '../flowTypes'
import { hasEntitySchema } from '../types'
import optimisticRemove from './optimisticRemove'
import removeReferencesToDeletedEntities from './removeReferencesToDeletedEntities'

const defaultEntityCachePolicy = optimisticRemove
const defaultArrayCachePolicy = removeReferencesToDeletedEntities

const getCachePolicy = (types: ApiTypeMap, entityType: EntityType) =>
  types[entityType].cachePolicy ||
  (hasEntitySchema(types, entityType)
    ? defaultEntityCachePolicy
    : defaultArrayCachePolicy)

export default getCachePolicy
