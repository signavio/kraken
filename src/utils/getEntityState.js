// @flow
import invariant from 'invariant'
import { denormalize as denormalizeValue } from 'normalizr'

import { type ApiTypeMap, type KrakenState } from '../flowTypes'
import { hasEntitySchema } from '../types'
import getCachedValue from './getCachedValue'
import getEntityCollectionState from './getEntityCollectionState'

function getEntityState<EntityType>(
  types: ApiTypeMap,
  krakenState: KrakenState,
  entityType: string,
  requestId: string,
  denormalize: ?boolean
): void | EntityType {
  const cachedValue = getCachedValue(types, krakenState, entityType, requestId)

  const entityCollection = getEntityCollectionState<EntityType>(
    types,
    krakenState,
    entityType
  )

  const { schema } = types[entityType]

  if (!cachedValue) {
    return undefined
  }

  if (denormalize) {
    return denormalizeValue(cachedValue, schema, krakenState.entities)
  }

  if (Array.isArray(cachedValue)) {
    return ((cachedValue.map(
      (id: string) => entityCollection[id]
    ): any): EntityType)
  }

  invariant(
    hasEntitySchema(types, entityType),
    `Cached value for entity type "${entityType}" for request "${requestId}" hinted at "Entity" schema but it was something different. `
  )

  return ((entityCollection[cachedValue]: any): EntityType)
}

export default getEntityState
