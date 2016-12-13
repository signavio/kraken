import deriveRequestId from './deriveRequestId'

export default (types, state, type, method, payload) => {
  const requestId = deriveRequestId(method, payload)
  return state.cache.promises[type][requestId]
}
