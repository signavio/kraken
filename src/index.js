import reducerCreator from './reducers'
import middlewareCreator from './middleware'
import connectCreator from './components/connect'
import actionsCreator from './actions'

export default (types) => ({
  reducer: reducerCreator(types),
  middleware: middlewareCreator(types),
  connect: connectCreator(types),
  actions: actionsCreator(types),
})

export * as promise from './utils/promise'
export * as typeUtils from './types'
