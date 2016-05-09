import { takeEvery, delay } from 'redux-saga'

import { put, call, fork } from 'redux-saga/effects'
import actionsCreator from '../actions'
import { getFetch } from '../types'
import { getPromiseState, getPromiseValue, getEntityState } from '../utils'

export const createFetchEntity = (types) => {

  const actions = actionsCreator(types)

  return function* fetchEntity(type, query, getPromise) {
    // console.log(type);
    const promise = getPromise(type, query)

    if (!promise.outstanding) {
      return
    }

    const fetch = getFetch(types, type)
    yield put(actions.request(type, query))

    const { response, error } = yield call(fetch, query)
    if (response) {
      yield put(actions.success(type, query, response.result, response.entities))
    } else {
      yield put(actions.failure(type, query, error))
    }
  }
}

export const createLoadEntity = (types) => {

  const actions = actionsCreator(types)

  const fetchEntity = createFetchEntity(types)

  // fetch entity unless it is cached or already being fetched
  return function* loadEntity(type, query, requiredFields, getEntity, getValue, getPromise) {
    const entity = getEntity(type, query)
    const foundInCache = !entity

      // if (foundInCache) yield call(fetchEntity, type, query, getPromise)
    if (!foundInCache) {
      yield put(actions.cacheHit(type, query, getValue(type, query)))
      return
    }

    yield call(delay, 1)
    yield call(fetchEntity, type, query, getPromise)
  }
}

export const createWatchLoadEntity = (types) => {
  const actions = actionsCreator(types)

  const loadEntity = createLoadEntity(types)

  return function* watchLoadEntity(getEntity, getValue, getPromise) {
    yield* takeEvery(
      actions.LOAD_ENTITY,
      action => loadEntity(
        action.entity, action.query,
        action.requiredFields,
        getEntity, getValue, getPromise
      )
    )
  }
}

export default (types) => {

  const watchLoadEntity = createWatchLoadEntity(types)

  return function* root(getState) {
    const getEntity = (type, query) => getEntityState(getState(), type, query, types)
    const getValue = (type, query) => getPromiseValue(getState(), type, query, types)
    const getPromise = (type, query) => getPromiseState(getState(), type, query, types)

    yield fork(watchLoadEntity, getEntity, getValue, getPromise)
      // yield form(watchBatchedRequest)
  }
}


// function* fetchAllBatched() {
//     yield call(delay)
//     yied fork(  )
// }

// function* watchBatchedRequest() {
//     yield* takeLatest(
//         BATCHED_REQUEST,
//         action => fetchAllBatched()
//     )
// }
