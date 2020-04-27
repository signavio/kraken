// @flow
import { isArray } from 'lodash'

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

  let finalValue

  if (isArray(value)) {
    finalValue = value.map((id: string) => entityCollection[id])
  } else if (hasEntitySchema(types, action.payload.entityType)) {
    finalValue = entityCollection[value]
  }

  return finalValue
}

export default getEntityState
