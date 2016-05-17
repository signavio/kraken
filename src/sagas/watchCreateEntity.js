import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { CREATE_ENTITY } from '../actions'
import { getCreate } from '../types'
import { deriveRequestId } from '../utils'


export const createCreateEntity = (types) => {
  const actions = createActionCreators(types)

  return function* createEntity(type, body, requestId) {
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


export default function createWatchCreateEntity(types) {
  const createEntity = createCreateEntity(types)

  return function* watchCreateEntity() {
    yield* takeEvery(
      CREATE_ENTITY,
      (action) => createEntity(
        action.payload.entity, action.payload.body, deriveRequestId(action)
      )
    )
  }
}
