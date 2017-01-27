import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import { ApiTypeMap, CreateDispatchAction } from '../internalTypes'

import createActionCreators from '../actions'
import { getCreate } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export const createCreateDispatch = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* createEntity(action: CreateDispatchAction) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType
    const create = getCreate(types, entityType)

    const result = yield call(create, action.payload.body)

    if (result.response) {
      yield put(
        actionCreators.succeedCreate({
          entityType,
          requestId,
          value: result.response.result,
          entities: result.response.entities,
        })
      )
    } else {
      yield put(
        actionCreators.failCreate({
          entityType,
          requestId,
          error: result.error,
        })
      )
    }
  }
}

const createWatchCreateDispatch = (types: ApiTypeMap) => {
  const createDispatch = createCreateDispatch(types)

  return function* watchCreateDispatch() {
    yield* takeEvery('CREATE_DISPATCH', createDispatch)
  }
}

export default createWatchCreateDispatch
