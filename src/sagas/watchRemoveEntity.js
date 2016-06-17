import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { REMOVE_ENTITY } from '../actions'
import { getRemove } from '../types'
import { deriveRequestIdFromAction } from '../utils'


export function createRemoveEntity(types) {
  const actions = createActionCreators(types)

  return function* removeEntity(type, query, getPromise) {
    const requestId = deriveRequestId(method, { query })
    const promise = getPromise(type, requestId)

    // if(promise.pending) {
    //     // TODO what do we want to do now?
    // }

    const remove = getRemove(types, type)
    yield put(actions.request(type, requestId))

    // TODO to be cool, do an optimistic remove of the entity cache and revert to
    // previous state stored in `entity` var if the request fails

    const { response, error } = yield call(remove, query)
    if (response) {
      yield put(actions.success(type, requestId))
    } else {
      yield put(actions.failure(type, requestId, error))
    }
  }
}

export default function createWatchEntity(types) {
  const removeEntity = createRemoveEntity(types)

  return function* watchRemoveEntity(getPromise) {
    yield* takeEvery(
      REMOVE_ENTITY,
      ({ payload }) => removeEntity(
        payload.entity, payload.id,
        getPromise
      )
    )
  }
}
