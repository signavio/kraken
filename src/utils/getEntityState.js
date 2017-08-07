import { denormalize } from 'normalizr'
import { hasEntitySchema } from '../types'
import { ApiTypeMap, State, DispatchAction, Entity } from '../internalTypes'

import getEntityCollectionState from './getEntityCollectionState'
import getCachedValue from './getCachedValue'

type MaybeEntity = Entity | undefined

const getEntityState = (
  types: ApiTypeMap,
  state: State,
  action: DispatchAction
): MaybeEntity => {
  const value = getCachedValue(types, state, action)

  if (value === undefined) {
    return undefined
  }

  const entityCollection = getEntityCollectionState(
    types,
    state,
    action.payload.entityType
  )

  if (typeof value === 'string') {
    if (hasEntitySchema(types, action.payload.entityType)) {
      return denormalize(
        entityCollection[value],
        types[action.payload.entityType].schema,
        state.kraken.entities
      )
    }
  } else {
    return denormalize(
      value,
      types[action.payload.entityType].schema,
      state.kraken.entities
    )
  }

  return undefined
}

export default getEntityState
