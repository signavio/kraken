import { spawn } from 'redux-saga/effects'

import { ApiTypeMap, StateGetter } from '../internalTypes'

import createWatchCreateDispatch from './watchCreateDispatch'
import createWatchUpdateDispatch from './watchUpdateDispatch'
import createWatchFetchDispatch  from './watchFetchDispatch'
import createWatchRemoveDispatch from './watchRemoveDispatch'

const createSaga = (types: ApiTypeMap) => {
  const watchCreateEntity = createWatchCreateDispatch(types)
  const watchUpdateEntity = createWatchUpdateDispatch(types)
  const watchFetchEntity  = createWatchFetchDispatch(types)
  const watchRemoveEntity = createWatchRemoveDispatch(types)

  return function* rootSaga(getState: StateGetter) {
    yield spawn(watchCreateEntity)
    yield spawn(watchUpdateEntity)
    yield spawn(watchFetchEntity, getState)
    yield spawn(watchRemoveEntity)
  }
}

export default createSaga
