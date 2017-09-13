import { take, cancel, fork } from 'redux-saga/effects'

const takeLatestOfEvery = (getBucketKey, saga, ...args) =>
  fork(function*() {
    const lastTaskOfBucket = {}
    while (true) {
      const action = yield take('*')
      const key = getBucketKey(action)
      if (!key) {
        // if getBucketKey returns a falsy value do not take this action
        continue
      }

      if (lastTaskOfBucket[key]) {
        yield cancel(lastTaskOfBucket[key])
      }
      lastTaskOfBucket[key] = yield fork(function*() {
        yield call(saga, ...args.concat(action))
        delete lastTaskOfBucket[key]
      })
    }
  })

export default takeLatestOfEvery
