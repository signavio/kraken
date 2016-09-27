import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { REMOVE_ENTITY } from '../actions'
import { getRemove } from '../types'
import { deriveRequestIdFromAction } from '../utils'


export function createRemoveEntity(types) {
  const actions = createActionCreators(types)

  return function* removeEntity(type, requestId, query, body, getEntity, getPromise) {
    // const promise = getPromise(type, 'remove', { requestId })

    // if(promise.pending) {
    //     // TODO what do we want to do now?
    // }

    const remove = getRemove(types, type)
    yield put(actions.request(type, requestId, body))

    // TODO to be cool, do an optimistic remove of the entity cache and revert to
    // previous state stored in `entity` var if the request fails

    const { response = {}, error } = yield call(remove, query, body)
    if (!error) {
      yield put(actions.success(type, requestId, response.result, response.entities))
    } else {
      yield put(actions.failure(type, requestId, error))
    }
  }
}

export default function createWatchRemoveEntity(types) {
  const removeEntity = createRemoveEntity(types)

  return function* watchRemoveEntity(getEntity, getPromise) {
    yield* takeEvery(
      REMOVE_ENTITY,
      (action) => removeEntity(
        action.payload.entity, deriveRequestIdFromAction(action),
        action.payload.query, action.payload.body,
        getEntity, getPromise
      )
    )
  }
}
