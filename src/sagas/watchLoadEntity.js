import { takeEvery, delay } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import createActionCreators, { FETCH_ENTITY } from '../actions'
import { getFetch } from '../types'
import { deriveRequestId } from '../utils'

export const createFetchEntity = (types) => {

  const actions = createActionCreators(types)

  return function* fetchEntity(type, query, getPromise) {
    const requestId = deriveRequestId('fetch', { query })
    const promise = getPromise(type, 'fetch', { query })

    if (promise && !promise.outstanding) {
      return
    }

    const fetch = getFetch(types, type)
    yield put(actions.request(type, requestId))

    const { response, error } = yield call(fetch, query)
    if (response) {
      yield put(actions.success(type, requestId, response.result, response.entities))
    } else {
      yield put(actions.failure(type, requestId, error))
    }
  }
}

export const createLoadEntity = (types) => {
  const actions = createActionCreators(types)
  const fetchEntity = createFetchEntity(types)

  // fetch entity unless it is cached or already being fetched
  return function* loadEntity(type, query, refresh, requiredFields, getValue, getPromise) {
    const value = getValue(type, 'fetch', { query })
    const foundInCache = !!value

    if (foundInCache && !refresh) {
      yield put(actions.cacheHit(type, query, value))
      return
    }

    yield call(delay, 1)
    yield call(fetchEntity, type, query, getPromise)
  }
}


export default function createWatchLoadEntity(types) {
  const loadEntity = createLoadEntity(types)

  return function* watchLoadEntity(getValue, getPromise) {
    yield* takeEvery(
      FETCH_ENTITY,
      ({ payload = {} }) => loadEntity(
        payload.entity,
        payload.query,
        payload.refresh,
        payload.requiredFields,
        getValue,
        getPromise,
      )
    )
  }
}
