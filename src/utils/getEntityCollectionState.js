import { ApiTypeMap, State, EntityType } from '../internalTypes'

import { getCollectionName } from '../types'

export default function getEntityCollectionState(
  types: ApiTypeMap,
  state: State,
  entityType: EntityType
) {
  return state.genericApi.entities[getCollectionName(types, entityType)]
}
