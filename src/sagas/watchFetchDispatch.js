import { isNil, omitBy } from 'lodash'
import { call, delay, put, takeEvery } from 'redux-saga/effects'

import createActionCreators, { actionTypes } from '../actions'
import {
  ApiTypeMap,
  FetchDispatchAction,
  State,
  StateGetter,
} from '../flowTypes'
import { getFetch } from '../types'
import { deriveRequestIdFromAction, getRequestState } from '../utils'

export const createFetchSaga = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* fetchSaga(
    action: FetchDispatchAction,
    getState: StateGetter
  ) {
    yield delay(1) // throttle to avoid duplicate requests

    const requestId = deriveRequestIdFromAction(action)
    const request = getRequestState(types, getState(), action)
    const entityType = action.payload.entityType

    if (request && !request.outstanding) {
      return
    }

    yield put(actionCreators.startRequest({ entityType, requestId }))

    const fetch = getFetch(types, entityType)
    const { response, error, status } = yield call(
      fetch,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (!error) {
      yield put(
        actionCreators.succeedFetch({
          entityType,
          requestId,
          responseHeaders: response && response.responseHeaders,
          value: response && response.result,
          entities: response && response.entities,
          isCachedResponse: false,
        })
      )
    } else {
      yield put(
        actionCreators.failFetch({
          entityType,
          requestId,
          ...omitBy({ error, status }, isNil),
        })
      )
    }
  }
}

export default function createWatchFetchEntity(types: ApiTypeMap) {
  const fetchSaga = createFetchSaga(types)

  return function* watchDispatchEntity(getState: () => State) {
    yield takeEvery(actionTypes.FETCH_DISPATCH, (action: FetchDispatchAction) =>
      fetchSaga(action, getState)
    )
  }
}
