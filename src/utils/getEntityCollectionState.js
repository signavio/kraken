// @flow
import type { ApiTypesT, StateT, EntityCollectionT } from '../flowTypes'

import { getCollection } from '../types'

export default function getEntityCollectionState<T>(
  types: ApiTypesT,
  state: StateT,
  type: string
): EntityCollectionT<T> {
  if (!state.cache || !state.cache.entities) {
    return {}
  }

  return state.cache.entities[getCollection(types, type)]
}
