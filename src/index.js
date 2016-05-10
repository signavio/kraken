import createReducer from './reducers'
import createSagaMiddleware from './middleware'
import createConnect from './components/connect'
import createActions from './actions'

export default (types) => ({
  reducer: createReducer(types),
  saga: createSagaMiddleware(types),
  connect: createConnect(types),
  actions: createActions(types),
})

export * as promise from './utils/promise'
export * as typeUtils from './types'
