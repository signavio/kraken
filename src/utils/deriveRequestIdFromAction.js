import { FETCH_ENTITY, CACHE_HIT, CREATE_ENTITY, UPDATE_ENTITY, REMOVE_ENTITY } from '../actions'

import deriveRequestId from './deriveRequestId'

const methodForActionType = (type) => ({
  [FETCH_ENTITY]: 'fetch',
  [CACHE_HIT]: 'fetch',
  [CREATE_ENTITY]: 'create',
  [UPDATE_ENTITY]: 'update',
  [REMOVE_ENTITY]: 'remove',
}[type])

export default ({ type, payload = {} }) => {
  const { requestId } = payload

  return requestId || deriveRequestId(methodForActionType(type), payload)
}
