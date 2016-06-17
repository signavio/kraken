import { spawn } from 'redux-saga/effects'

import { getPromiseState, getCachedValue, getEntityState } from '../utils'
import createWatchLoadEntity from './watchLoadEntity'
import createWatchCreateEntity from './watchCreateEntity'
import createWatchUpdateEntity from './watchUpdateEntity'
import createWatchRemoveEntity from './watchRemoveEntity'

export default (types) => {

  const watchLoadEntity = createWatchLoadEntity(types)
  const watchCreateEntity = createWatchCreateEntity(types)
  const watchUpdateEntity = createWatchUpdateEntity(types)
  const watchRemoveEntity = createWatchRemoveEntity(types)

  return function* rootSaga(getState) {

    const getValue = (type, method, payload) => {
      getCachedValue(types, getState(), type, method, payload)
    }

    const getEntity = (type, method, payload) => (
      getEntityState(types, getState(), type, method, payload)
    )

    const getPromise = (type, method, payload) => (
      getPromiseState(types, getState(), type, method, payload)
    )

    yield spawn(watchLoadEntity, getValue, getPromise)
    yield spawn(watchCreateEntity)
    yield spawn(watchUpdateEntity, getEntity, getPromise)
    yield spawn(watchRemoveEntity, getEntity)
  }
}
