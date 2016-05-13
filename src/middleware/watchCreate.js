import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'
import uniqueId from 'lodash/uniqueId'

import { CREATE_ENTITY } from '../actions'
import * as actions from '../actions'
import { getCreate } from '../types'


function* createEntity(type, body) {
  const create = getCreate(type)
  const requestId = uniqueId('create_')
  yield put( actions.create(type, requestId, body) )

  const {response, error} = yield call(create, body)
  if(response)
    yield put( actions.success(type, requestId, response.result, response.entities) )
  else
    yield put( actions.failure(type, requestId, error) )
}

export default function* watchCreateEntity() {
  yield* takeEvery(
    CREATE_ENTITY, 
    ({ payload }) => createEntity(
      payload.entity, payload.body
    )
  )
}