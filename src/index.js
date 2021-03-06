// @flow
import createActions, { actionTypes } from './actions'
import { cachePolicies } from './cachePolicies'
import callApi from './callApi'
import createConnect from './components'
import type { ApiTypeMap } from './flowTypes'
import createUseApi from './hooks'
import createReducer from './reducers'
import createSaga from './sagas'
import * as typeUtils from './types'
import * as promise from './utils/promise'

export * from './flowTypes'
export * from './hooks'

const apiCreator = (types: ApiTypeMap) => {
  const preparedTypes = Object.keys(types).reduce(
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
    reducer: createReducer(preparedTypes),
    saga: createSaga(preparedTypes),
    connect: createConnect(preparedTypes),
    useApi: createUseApi(preparedTypes),
    actions: createActions(preparedTypes),
  }
}

export default apiCreator

export { promise, typeUtils, callApi, actionTypes, cachePolicies }
