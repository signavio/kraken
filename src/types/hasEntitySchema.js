// @flow
import { schema } from 'normalizr'

import { type ApiTypeMap, type EntityType } from '../internalTypes'

const hasEntitySchema = (types: ApiTypeMap, entityType: EntityType): boolean =>
  types[entityType].schema instanceof schema.Entity

export default hasEntitySchema
