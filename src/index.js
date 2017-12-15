import createReducer from './reducers'
import createSaga from './sagas'
import createConnect from './components'
import createActions, { actionTypes } from './actions'
import * as cachePolicies from './cachePolicies'

import * as promise from './utils/promise'
import * as typeUtils from './types'

import type { ApiTypeMap } from './internalTypes'

import callApi from './callApi'

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
    actions: createActions(preparedTypes),
  }
}

export default apiCreator

export { promise, typeUtils, callApi, actionTypes, cachePolicies }
