import { put, call } from 'redux-saga/effects'
import { omitBy, isNil } from 'lodash'

import { ApiTypeMap, UpdateDispatchAction, Action } from '../flowTypes'

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
    const result = yield call(
      update,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

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
          ...omitBy({ error: result.error, status: result.status }, isNil),
        })
      )
    }
  }
}

const mapActionToEntity = ({ type, payload = {} }: Action) => {
  if (type !== actionTypes.UPDATE_DISPATCH) {
    return false
  }
  const { entityType, query } = payload
  return `${entityType}_${stringifyQuery(query)}`
}

export default function createWatchUpdateDispatch(types: ApiTypeMap) {
  const updateDispatch = createUpdateDispatch(types)

  return function* watchUpdateDispatch() {
    yield takeLatestOfEvery(mapActionToEntity, updateDispatch)
  }
}
