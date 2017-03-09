import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import { ApiTypeMap, RemoveDispatchAction, StateGetter } from '../internalTypes'

import createActionCreators, { actionTypes } from '../actions'
import { getRemove } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export function createRemoveDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* removeEntity(action: RemoveDispatchAction) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType

    const remove = getRemove(types, entityType)
    const { response, error } = yield call(remove, action.payload.query)

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
          error: result.error,
        })
      )
    }
  }
}

export default function createWatchRemoveDispatch(types: ApiTypeMap) {
  const removeDispatch = createRemoveDispatch(types)

  return function* watchRemoveDispatch() {
    yield* takeEvery(actionTypes.REMOVE_DISPATCH, (action: RemoveDispatchAction) => removeDispatch(action))
  }
}
