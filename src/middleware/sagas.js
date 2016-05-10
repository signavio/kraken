import { takeEvery, delay } from 'redux-saga'
import { put, call, spawn } from 'redux-saga/effects'

import createActionCreators, { LOAD_ENTITY } from '../actions'
import { getFetch } from '../types'
import { getPromiseState, getPromiseValue, getEntityState } from '../utils'

export const createFetchEntity = (types) => {

  const actions = createActionCreators(types)

  return function* fetchEntity(type, query, getPromise) {

    const promise = getPromise(type, query)

    if (promise && !promise.outstanding) {
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

  const actions = createActionCreators(types)

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

  const loadEntity = createLoadEntity(types)

  return function* watchLoadEntity(getEntity, getValue, getPromise) {
    yield* takeEvery(
      LOAD_ENTITY,
      ({ payload = {} }) => loadEntity(
        payload.entity,
        payload.query,
        payload.requiredFields,
        getEntity,
        getValue,
        getPromise,
      )
    )
  }
}

export default (types) => {

  const watchLoadEntity = createWatchLoadEntity(types)

  return function* root(getState) {
    console.log('sagas.root.getState', getState)
    const getEntity = (type, query) => getEntityState(getState(), type, query, types)
    const getValue = (type, query) => getPromiseValue(getState(), type, query, types)
    const getPromise = (type, query) => getPromiseState(getState(), type, query, types)

    yield spawn(watchLoadEntity, getEntity, getValue, getPromise)
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
