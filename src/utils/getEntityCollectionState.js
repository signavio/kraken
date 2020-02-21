// @flow
import {
  type ApiTypeMap,
  type EntitiesState,
  type KrakenState,
} from '../flowTypes'
import { getCollectionName } from '../types'

export default function getEntityCollectionState<EntityType>(
  types: ApiTypeMap,
  krakenState: KrakenState,
  entityType: string
): EntitiesState<EntityType> {
  return krakenState.entities[getCollectionName(types, entityType)]
}
