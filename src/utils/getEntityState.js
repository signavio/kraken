// @flow
import { isArray } from 'lodash'
import { denormalize } from 'normalizr'

import {
  type ApiTypeMap,
  type DispatchAction,
  type Entity,
  type KrakenState,
} from '../flowTypes'
import { hasEntitySchema } from '../types'
import getCachedValue from './getCachedValue'
import getEntityCollectionState from './getEntityCollectionState'

type MaybeEntity = Entity | typeof undefined

const getEntityState = (
  types: ApiTypeMap,
  krakenState: KrakenState,
  action: DispatchAction
): MaybeEntity => {
  const value = getCachedValue(types, krakenState, action)

  const entityCollection = getEntityCollectionState(
    types,
    krakenState,
    action.payload.entityType
  )

  const { denormalizeValue, entityType } = action.payload
  let finalValue

  if (isArray(value)) {
    finalValue = value.map((id: string) => entityCollection[id])
  } else if (hasEntitySchema(types, action.payload.entityType)) {
    finalValue = entityCollection[value]
  }

  if (finalValue) {
    if (denormalizeValue) {
      const { schema } = types[entityType]

      return denormalize(value, schema, krakenState.entities)
    }

    return finalValue
  }

  return undefined
}

export default getEntityState
