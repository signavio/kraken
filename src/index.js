import createReducer from './reducers'
import createSaga from './sagas'
import createConnect from './components'
import createActions from './actions'

const apiCreator = (types) => {
  types = Object.keys(types).reduce(
    (prev, key) => ({
      ...prev,
      [key]: {
        ...types[key],
        key,
      },
    }),
    {}
  )

  return {
    reducer: createReducer(types),
    saga:    createSaga(types),
    connect: createConnect(types),
    actions: createActions(types),
  }
}

import * as promise from './utils/promise'
import * as typeUtils from './types'

import callApi from './callApi'

export default apiCreator

export {
  promise,
  typeUtils,
  callApi,
}
