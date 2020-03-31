import { spawn } from 'redux-saga/effects'

import { ApiTypeMap, StateGetter } from '../flowTypes'
import createWatchCreateDispatch from './watchCreateDispatch'
import createWatchFetchDispatch from './watchFetchDispatch'
import createWatchRemoveDispatch from './watchRemoveDispatch'
import createWatchUpdateDispatch from './watchUpdateDispatch'

const createSaga = (types: ApiTypeMap) => {
  const watchCreateEntity = createWatchCreateDispatch(types)
  const watchUpdateEntity = createWatchUpdateDispatch(types)
  const watchFetchEntity = createWatchFetchDispatch(types)
  const watchRemoveEntity = createWatchRemoveDispatch(types)

  return function* rootSaga(getState: StateGetter) {
    yield spawn(watchCreateEntity, getState)
    yield spawn(watchUpdateEntity, getState)
    yield spawn(watchFetchEntity, getState)
    yield spawn(watchRemoveEntity, getState)
  }
}

export default createSaga
