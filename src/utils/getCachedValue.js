// @flow
import { findKey } from 'lodash'

import { type ApiTypeMap, type KrakenState, type Query } from '../flowTypes'
import { hasEntitySchema } from '../types'
import getEntityCollectionState from './getEntityCollectionState'
import getRequestState from './getRequestState'

const getCachedValue = (
  types: ApiTypeMap,
  krakenState: KrakenState,
  entityType: string,
  requestId: string
): null | string | Array<string> => {
  let requestState = getRequestState(krakenState, entityType, requestId)

  if (requestState === undefined) {
    requestState = {}
  }

  if (hasEntitySchema(types, entityType)) {
    const entityCollection = getEntityCollectionState(
      types,
      krakenState,
      entityType
    )

    const [, queryString] = requestId.split('_')

    // return requestState.value || findKey(entityCollection, action.payload.query)

    return (
      requestState.value || findKey(entityCollection, JSON.parse(queryString))
    )
  }

  return requestState.value
}

export default getCachedValue
