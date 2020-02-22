// @flow
import { findKey } from 'lodash'

import { type ApiTypeMap, type KrakenState } from '../flowTypes'
import { hasEntitySchema } from '../types'
import getEntityCollectionState from './getEntityCollectionState'
import getRequestState from './getRequestState'

const getCachedValue = (
  types: ApiTypeMap,
  krakenState: KrakenState,
  entityType: string,
  requestId: string
): null | string | Array<string> => {
  const requestState = getRequestState(krakenState, entityType, requestId) || {}

  if (hasEntitySchema(types, entityType)) {
    const entityCollection = getEntityCollectionState(
      types,
      krakenState,
      entityType
    )

    const [, queryString] = requestId.split('_')

    return (
      requestState.value ||
      findKey(entityCollection, fromEntries(JSON.parse(queryString)))
    )
  }

  return requestState.value
}

const fromEntries = entries => {
  if (Object.fromEntries) {
    return Object.fromEntries(entries)
  }

  return entries.reduce(
    (result, [key, value]) => ({
      ...result,
      [key]: value,
    }),
    {}
  )
}

export default getCachedValue
