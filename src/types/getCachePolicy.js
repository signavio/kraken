// @flow
import {
  optimisticRemove,
  removeReferencesToDeletedEntities,
} from '../cachePolicies'

import { ApiTypeMap, EntityType } from '../internalTypes'

import hasEntitySchema from './hasEntitySchema'

const defaultEntityCachePolicy = optimisticRemove
const defaultArrayCachePolicy = removeReferencesToDeletedEntities

const getCachePolicy = (types: ApiTypeMap, entityType: EntityType) =>
  types[entityType].cachePolicy ||
  (hasEntitySchema(types, entityType)
    ? defaultEntityCachePolicy
    : defaultArrayCachePolicy)

export default getCachePolicy
