import { put, call, takeEvery } from 'redux-saga/effects'
import { get, omitBy, isNil } from 'lodash'

import { ApiTypeMap, CreateDispatchAction } from '../flowTypes'

import createActionCreators, { actionTypes } from '../actions'
import { getCreate } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export const createCreateDispatch = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* createEntity(action: CreateDispatchAction) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType
    const create = getCreate(types, entityType)

    const result = yield call(
      create,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (!result.error) {
      yield put(
        actionCreators.succeedCreate({
          entityType,
          requestId,
          value: get(result, 'response.result'),
          entities: get(result, 'response.entities', {}),
        })
      )
    } else {
      yield put(
        actionCreators.failCreate({
          entityType,
          requestId,
          ...omitBy({ error: result.error, status: result.status }, isNil),
        })
      )
    }
  }
}

const createWatchCreateDispatch = (types: ApiTypeMap) => {
  const createDispatch = createCreateDispatch(types)

  return function* watchCreateDispatch() {
    yield takeEvery(actionTypes.CREATE_DISPATCH, createDispatch)
  }
}

export default createWatchCreateDispatch
