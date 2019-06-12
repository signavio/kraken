import { findKey } from 'lodash'

import { hasEntitySchema } from '../types'
import { actionTypes } from '../actions'
import { State, ApiTypeMap, DispatchAction, EntityId } from '../flowTypes'

import getRequestState from './getRequestState'
import getEntityCollectionState from './getEntityCollectionState'

const getCachedValue = (
  types: ApiTypeMap,
  state: State,
  action: DispatchAction
): EntityId | EntityId[] | undefined => {
  let requestState = getRequestState(types, state, action)

  if (requestState === undefined) {
    requestState = {}
  }

  if (action.type === actionTypes.FETCH_DISPATCH) {
    if (action.payload.refresh !== undefined && action.payload.refresh !== requestState.refresh) {
      return undefined
    }
  }

  const entityType = action.payload.entityType
  if (hasEntitySchema(types, entityType)) {
    const entityCollection = getEntityCollectionState(types, state, entityType)

    return requestState.value || findKey(entityCollection, action.payload.query)
  }

  return requestState.value
}

export default getCachedValue
