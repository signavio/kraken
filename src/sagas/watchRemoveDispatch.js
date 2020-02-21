import { isNil, omitBy } from 'lodash'
import { call, put, takeEvery } from 'redux-saga/effects'

import createActionCreators, { actionTypes } from '../actions'
import { ApiTypeMap, RemoveDispatchAction } from '../flowTypes'
import { getRemove } from '../types'
import { getMethodName, getRequestId } from '../utils'

export function createRemoveDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* removeEntity(action: RemoveDispatchAction) {
    const requestId = getRequestId(
      getMethodName(action),
      action.payload.query,
      action.payload.requestParams,
      action.payload.elementId
    )
    const entityType = action.payload.entityType

    const remove = getRemove(types, entityType)
    const { error, status } = yield call(
      remove,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (!error) {
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

  return function* watchRemoveDispatch() {
    yield takeEvery(
      actionTypes.REMOVE_DISPATCH,
      (action: RemoveDispatchAction) => removeDispatch(action)
    )
  }
}
