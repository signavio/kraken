import { spawn } from 'redux-saga/effects'

import {
  getPromiseState, getPromiseValue,
  getEntityState, getEntityCollectionState,
} from '../utils'
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
    const getEntity = (type, query) => getEntityState(getState(), type, query, types)
    const getEntityById = (type, id) => getEntityCollectionState(getState(), type)[id]
    const getValue = (type, query) => getPromiseValue(getState(), type, query, types)
    const getPromise = (type, query) => getPromiseState(getState(), type, query, types)

    yield spawn(watchLoadEntity, getEntity, getValue, getPromise)
    yield spawn(watchCreateEntity)
    yield spawn(watchUpdateEntity, getEntityById, getPromise)
    yield spawn(watchRemoveEntity, getEntityById)
  }
}
