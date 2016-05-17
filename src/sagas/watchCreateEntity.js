import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'
import uniqueId from 'lodash/uniqueId'

import createActionCreators, { CREATE_ENTITY } from '../actions'
import { getCreate } from '../types'


export const createCreateEntity = (types) => {
  const actions = createActionCreators(types)

  return function* createEntity(type, body) {
    const create = getCreate(types, type)
    const requestId = uniqueId('create_')
    yield put(actions.create(type, requestId, body))

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
      ({ payload }) => createEntity(
        payload.entity, payload.body
      )
    )
  }
}
