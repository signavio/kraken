// @flow
import { hasEntitySchema } from '../types'
import type { ApiTypesT, StateT, MethodT, PayloadT } from '../flowTypes'

import getEntityCollectionState from './getEntityCollectionState'
import getCachedValue from './getCachedValue'

export default function getEntityState<T>(
  types: ApiTypesT,
  state: StateT,
  type: string,
  method: MethodT,
  payload: PayloadT,
): ?T {
  const value = getCachedValue(types, state, type, method, payload)

  if (!value) {
    return null
  }

  const entityCollection = getEntityCollectionState(types, state, type)

  if (hasEntitySchema(types, type)) {
    return entityCollection[value]
  }

  // array type: map ids in promise value to entities
  return value.map((id: string) => entityCollection[id])
}
