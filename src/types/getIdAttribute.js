// @flow
import { ApiTypeMap, EntityType } from '../internalTypes'

// Temporary workaround: normalizr 3.x has dropped getIdAttribute
const getIdAttribute = (types: ApiTypeMap, entityType: EntityType) => 'id'

export default getIdAttribute
