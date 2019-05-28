import { findKey } from 'lodash'

import { ApiTypeMap, DispatchAction, EntityId, State } from '../flowTypes'
import { hasEntitySchema } from '../types'
import getEntityCollectionState from './getEntityCollectionState'
import getRequestState from './getRequestState'

const getCachedValue = (
  types: ApiTypeMap,
  krakenState: State,
  action: DispatchAction
): EntityId | EntityId[] | undefined => {
  let requestState = getRequestState(types, krakenState.requests, action)

  if (requestState === undefined) {
    requestState = {}
  }

  const entityType = action.payload.entityType
  if (hasEntitySchema(types, entityType)) {
    const entityCollection = getEntityCollectionState(
      types,
      krakenState,
      entityType
    )

    return requestState.value || findKey(entityCollection, action.payload.query)
  }

  return requestState.value
}

export default getCachedValue
