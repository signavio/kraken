import { ApiTypeMap, State, EntityType } from '../internalTypes'

import { getCollectionName } from '../types'

export default function getEntityCollectionState(
  types: ApiTypeMap,
  state: State,
  entityType: EntityType
) {
  return state.kraken.entities[getCollectionName(types, entityType)]
}
