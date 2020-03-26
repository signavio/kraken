import { ApiTypeMap, State, DispatchAction } from '../flowTypes'

import deriveRequestIdFromAction from './deriveRequestIdFromAction'

const getRequestState = (
  types: ApiTypeMap,
  state: State,
  action: DispatchAction
) => {
  const requestId = deriveRequestIdFromAction(action)
  const entityTypeRequests = state.kraken.requests[action.payload.entityType]

  if (entityTypeRequests === undefined) {
    return undefined
  }

  return entityTypeRequests[requestId]
}

export default getRequestState
