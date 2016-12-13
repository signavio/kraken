// @flow
import type { StateT, ApiTypesT, MethodT, PayloadT, PromiseStateT } from '../flowTypes'

import deriveRequestId from './deriveRequestId'

export default function getPromiseState<T>(
  types: ApiTypesT,
  state: StateT,
  type: string,
  method: MethodT,
  payload: PayloadT
): ?PromiseStateT<T> {
  const requestId = deriveRequestId(method, payload)

  if (!state.cache || !state.cache.promises) {
    return null
  }

  return state.cache.promises[type][requestId]
}
