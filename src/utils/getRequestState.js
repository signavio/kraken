// @flow
import { type KrakenState } from '../flowTypes'

const getRequestState = (
  krakenState: KrakenState,
  entityType: string,
  requestId: string
) => {
  const entityTypeRequests = krakenState.requests[entityType]

  if (entityTypeRequests === undefined) {
    return undefined
  }

  return entityTypeRequests[requestId]
}

export default getRequestState
