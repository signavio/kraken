import { takeEvery, select } from 'redux-saga/effects'

export default function createLogActions(callback) {
  function* logActions(action) {
    yield select()
    callback(action)
  }

  return function* logEverything() {
    yield takeEvery('*', logActions)
  }
}
