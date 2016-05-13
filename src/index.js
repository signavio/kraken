import createReducer from './reducers'
import createSagaMiddleware from './middleware'
import createConnect from './components'
import createActions from './actions'

export default (types) => {
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
    saga: createSagaMiddleware(types),
    connect: createConnect(types),
    actions: createActions(types),
  }
}

export * as promise from './utils/promise'
export * as typeUtils from './types'

export callApi from './callApi'
