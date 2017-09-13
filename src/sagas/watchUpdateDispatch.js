import { takeEvery } from 'redux-saga'
import { put, call, fork } from 'redux-saga/effects'

import { ApiTypeMap, UpdateDispatchAction, Action } from '../internalTypes'

import createActionCreators, { actionTypes } from '../actions'
import { getUpdate } from '../types'
import {
  deriveRequestIdFromAction,
  stringifyQuery,
  takeLatestOfEvery,
} from '../utils'

export function createUpdateDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* updateEntity(action: UpdateDispatchAction) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType

    const update = getUpdate(types, entityType)
    const result = yield call(update, action.payload.query, action.payload.body)

    if (result.response) {
      yield put(
        actions.succeedUpdate({
          entityType,
          requestId,
          value: result.response.result,
          entities: result.response.entities,
        })
      )
    } else {
      yield put(
        actions.failUpdate({
          entityType,
          requestId,
          error: result.error,
        })
      )
    }
  }
}

const mapActionToEntity = ({
  type,
  payload: { entityType, query },
}: Action) => {
  if (type !== actionTypes.UPDATE_DISPATCH) {
    return false
  }
  return `${entityType}_${stringifyQuery(query)}`
}

export default function createWatchUpdateDispatch(types: ApiTypeMap) {
  const updateDispatch = createUpdateDispatch(types)

  return function* watchUpdateDispatch() {
    yield* takeLatestOfEvery(mapActionToEntity, updateDispatch)
  }
}
