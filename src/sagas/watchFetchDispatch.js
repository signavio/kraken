import { takeEvery, delay } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import { State, ApiTypeMap, FetchDispatchAction, StateGetter } from '../internalTypes'

import createActionCreators from '../actions'
import { getFetch } from '../types'
import { deriveRequestIdFromAction, getRequestState, getCachedValue } from '../utils'

export const createFetchDispatch = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* fetchDispatch(action: FetchDispatchAction, getState: StateGetter) {
    const requestId = deriveRequestIdFromAction(action)
    const request = getRequestState(types, getState(), action)
    const entityType = action.payload.entityType
    const value = getCachedValue(types, getState(), action)
    const fetch = getFetch(types, entityType)

    if (value !== undefined && !action.payload.refresh) {
      // TODO: Figure out entities
      yield put(actionCreators.succeedFetch({
        entityType,
        requestId,
        value,
        entities: [],
        isCachedResponse: true,
      }))
    } else {
      if (request && !request.outstanding) {
        return
      }

      const result = yield call(fetch, action.payload.query)

      if (result.response) {
        yield put(
          actionCreators.succeedFetch({
            entityType,
            requestId,
            value: result.response.result,
            entities: result.response.entities,
            isCachedResponse: false,
          })
        )
      } else {
        yield put(
          actionCreators.failFetch({
            entityType,
            requestId,
            error: result.error,
          })
        )
      }
    }
  }
}


export default function createWatchFetchEntity(types: ApiTypeMap) {
  const fetchDispatch = createFetchDispatch(types)

  return function* watchDispatchEntity(getState: () => State) {
    yield* takeEvery('FETCH_DISPATCH', (action: FetchDispatchAction) => {
      return fetchDispatch(action, getState)
    })
  }
}
