import { findKey } from 'lodash'

import { hasEntitySchema } from '../types'

import getPromiseState from './getPromiseState'
import getEntityCollectionState from './getEntityCollectionState'

export default (types, state, type, method, payload) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const { value, refresh: lastRefresh } = getPromiseState(types, state, type, method, payload) || {}
  const { query, refresh } = payload

  if (refresh && refresh !== lastRefresh) {
    return undefined
  }

  if (hasEntitySchema(types, type)) {
    // single item type: if there's no promise and refresh is not enforced,
    // try to retrieve from cache
    return value || findKey(entityCollection, query)
  }

  return value
}
