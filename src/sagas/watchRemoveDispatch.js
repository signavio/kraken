import { isNil, omitBy } from 'lodash'
import { call, put, takeEvery } from 'redux-saga/effects'

import createActionCreators, { actionTypes } from '../actions'
import callApi from '../callApi'
import { ApiTypeMap, RemoveDispatchAction, StateGetter } from '../flowTypes'
import { getRemove } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export function createRemoveDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* removeEntity(action: RemoveDispatchAction, getState) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType
    const { headers, credentials, apiBase } = getState().kraken.metaData

    const createRemove = getRemove(types, entityType)

    const remove = createRemove(
      (url, schema, options) =>
        callApi(url, schema, {
          credentials,
          ...options,
          headers: {
            ...headers,
            ...options?.headers,
          },
        }),
      apiBase
    )

    const { error, status } = yield call(
      remove,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (error == null) {
      yield put(
        actions.succeedRemove({
          entityType,
          requestId,
        })
      )
    } else {
      yield put(
        actions.failRemove({
          entityType,
          requestId,
          ...omitBy({ error, status }, isNil),
        })
      )
    }
  }
}

export default function createWatchRemoveDispatch(types: ApiTypeMap) {
  const removeDispatch = createRemoveDispatch(types)

  return function* watchRemoveDispatch(getState: StateGetter) {
    yield takeEvery(
      actionTypes.REMOVE_DISPATCH,
      (action: RemoveDispatchAction) => removeDispatch(action, getState)
    )
  }
}
