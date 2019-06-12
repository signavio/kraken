// @flow
import { type ApiTypeMap, type EntityType } from '../flowTypes'

// Temporary workaround: normalizr 3.x has dropped getIdAttribute
const getIdAttribute = (types: ApiTypeMap, entityType: EntityType) => 'id'

export default getIdAttribute
