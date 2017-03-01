import { takeEvery, delay } from 'redux-saga'
import { put, call, fork } from 'redux-saga/effects'

import { State, ApiTypeMap, FetchDispatchAction, StateGetter } from '../internalTypes'

import createActionCreators, { actionTypes } from '../actions'
import { getFetch } from '../types'
import { deriveRequestIdFromAction, getRequestState, getCachedValue } from '../utils'

export const createFetchSaga = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* fetchSaga(action: FetchDispatchAction, getState: StateGetter) {
    yield call(delay, 1) // throttle to avoid duplicate requests

    const requestId = deriveRequestIdFromAction(action)
    const request = getRequestState(types, getState(), action)
    const entityType = action.payload.entityType
    //const value = getCachedValue(types, getState(), action)

    if (request && !request.outstanding) {
      return
    }

    yield put(actionCreators.startRequest({ entityType, requestId }))

    const fetch = getFetch(types, entityType)
    const { response, error } = yield call(fetch, action.payload.query)

    if (response) {
      yield put(
        actionCreators.succeedFetch({
          entityType,
          requestId,
          value: response.result,
          entities: response.entities,
          isCachedResponse: false,
        })
      )
    } else {
      yield put(
        actionCreators.failFetch({
          entityType,
          requestId,
          error: error,
        })
      )
    }

  //   if (value !== undefined && !action.payload.refresh) {
  //     // TODO: Figure out entities
  //     yield put(actionCreators.succeedFetch({
  //       entityType,
  //       requestId,
  //       value,
  //       entities: [],
  //       isCachedResponse: true,
  //     }))
  //   } else {
  //     if (request && !request.outstanding) {
  //       return
  //     }

  //     const result = yield call(fetch, )


  //   }
  }
}


export default function createWatchFetchEntity(types: ApiTypeMap) {
  const fetchSaga = createFetchSaga(types)

  return function* watchDispatchEntity(getState: () => State) {
    const fetchSagas = {}
    yield* takeEvery(
      actionTypes.FETCH_DISPATCH,
      (action: FetchDispatchAction) => fetchSaga(action, getState)
    )
  }
}
