import { put, call, takeEvery } from 'redux-saga/effects'
import { omitBy, isNil } from 'lodash'

import { ApiTypeMap, RemoveDispatchAction } from '../internalTypes'

import createActionCreators, { actionTypes } from '../actions'
import { getRemove } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export function createRemoveDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* removeEntity(action: RemoveDispatchAction) {
    const requestId = deriveRequestIdFromAction(action)
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
