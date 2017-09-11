import { isArray } from 'lodash'
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

  const entityCollection = getEntityCollectionState(
    types,
    state,
    action.payload.entityType
  )

  if (isArray(value)) {
    return value.map((id: string) => entityCollection[id])
  } else if (hasEntitySchema(types, action.payload.entityType)) {
    return entityCollection[value]
  }

  return undefined
}

export default getEntityState
