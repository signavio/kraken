// @flow
import { findKey } from 'lodash'

import { hasEntitySchema } from '../types'
import type { StateT, ApiTypesT, MethodT, PayloadT } from '../flowTypes'

import getPromiseState from './getPromiseState'
import getEntityCollectionState from './getEntityCollectionState'

const getCachedValue = (
  types: ApiTypesT,
  state: StateT,
  type: string,
  method: MethodT,
  payload: PayloadT
): ?string => {
  const { value, refresh: lastRefresh } = getPromiseState(types, state, type, method, payload) || {}
  const { query, refresh } = payload

  if (refresh && refresh !== lastRefresh) {
    return undefined
  }

  if (hasEntitySchema(types, type)) {
    const entityCollection = getEntityCollectionState(types, state, type)

    // single item type: if there's no promise and refresh is not enforced,
    // try to retrieve from cache
    return value || findKey(entityCollection, query)
  }

  return value
}

export default getCachedValue
