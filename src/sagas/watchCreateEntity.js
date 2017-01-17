import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { CREATE_ENTITY } from '../actions'
import { getCreate } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export const createCreateEntity = (types) => {
  const actions = createActionCreators(types)

  return function* createEntity(type, requestId, body) {
    const create = getCreate(types, type)
    yield put(actions.request(type, requestId))

    const { response, error } = yield call(create, body)
    if (response) {
      yield put(actions.success(type, requestId, response.result, response.entities))
    } else {
      yield put(actions.failure(type, requestId, error))
    }
  }
}

const createWatchCreateEntity = (types) => {
  const createEntity = createCreateEntity(types)

  return function* watchCreateEntity() {
    yield* takeEvery(
      CREATE_ENTITY,
      (action) => createEntity(
        action.payload.entity,
        deriveRequestIdFromAction(action),
        action.payload.body
      )
    )
  }
}

export default createWatchCreateEntity
