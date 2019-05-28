import { ApiTypeMap, DispatchAction, State } from '../flowTypes'
import deriveRequestIdFromAction from './deriveRequestIdFromAction'

const getRequestState = (
  types: ApiTypeMap,
  requestState: State,
  action: DispatchAction
) => {
  const requestId = deriveRequestIdFromAction(action)
  const entityTypeRequests = requestState[action.payload.entityType]

  if (entityTypeRequests === undefined) {
    return undefined
  }

  return entityTypeRequests[requestId]
}

export default getRequestState
