import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { UPDATE_ENTITY } from '../actions'
import { getUpdate } from '../types'
import { deriveRequestIdFromAction } from '../utils'


export function createUpdateEntity(types) {
  const actions = createActionCreators(types)

  return function* updateEntity(type, requestId, query, body, getEntity, getPromise) {
    // const promise = getPromise(type, 'update', { query })

    // if(promise.pending) {
    //     // TODO what do we want to do now?
    // }

    const update = getUpdate(types, type)
    yield put(actions.request(type, requestId, body))

    // TODO to be cool, do an optimistic update of the entity cache and revert to
    // previous state stored in `entity` var if the request fails

    const { response, error } = yield call(update, query, body)
    if (response) {
      yield put(actions.success(type, requestId, response.result, response.entities))
    } else {
      yield put(actions.failure(type, requestId, error))
    }
  }
}

export default function createWatchUpdateEntity(types) {
  const updateEntity = createUpdateEntity(types)

  return function* watchUpdateEntity(getEntity, getPromise) {
    yield* takeEvery(
      UPDATE_ENTITY,
      (action) => updateEntity(
        action.payload.entity, deriveRequestIdFromAction(action),
        action.payload.query, action.payload.body,
        getEntity, getPromise
      )
    )
  }
}
