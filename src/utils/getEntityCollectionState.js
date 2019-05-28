import { ApiTypeMap, EntityType, State } from '../flowTypes'
import { getCollectionName } from '../types'

export default function getEntityCollectionState(
  types: ApiTypeMap,
  krakenState: State,
  entityType: EntityType
) {
  return krakenState.entities[getCollectionName(types, entityType)]
}
