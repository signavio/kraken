import { get, isNil, omitBy } from 'lodash'
import { call, put, takeEvery } from 'redux-saga/effects'

import createActionCreators, { actionTypes } from '../actions'
import callApi from '../callApi'
import { ApiTypeMap, CreateDispatchAction } from '../flowTypes'
import { getCreate } from '../types'
import { deriveRequestIdFromAction } from '../utils'

export const createCreateDispatch = (types: ApiTypeMap) => {
  const actionCreators = createActionCreators(types)

  return function* createEntity(action: CreateDispatchAction, getState) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType
    const createCreate = getCreate(types, entityType)

    const { headers, credentials, apiBase } = getState().kraken.metaData

    const create = createCreate(
      (url, schema, options) =>
        callApi(url, schema, {
          credentials,
          ...options,
          headers: {
            ...headers,
            ...options?.headers,
          },
        }),
      apiBase
    )

    const result = yield call(
      create,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (result.error == null) {
      yield put(
        actionCreators.succeedCreate({
          entityType,
          requestId,
          value: get(result, 'response.result'),
          entities: get(result, 'response.entities', {}),
        })
      )
    } else {
      yield put(
        actionCreators.failCreate({
          entityType,
          requestId,
          ...omitBy({ error: result.error, status: result.status }, isNil),
        })
      )
    }
  }
}

const createWatchCreateDispatch = (types: ApiTypeMap) => {
  const createDispatch = createCreateDispatch(types)

  return function* watchCreateDispatch(getState: StateGetter) {
    yield takeEvery(
      actionTypes.CREATE_DISPATCH,
      (action: CreateDispatchAction) => createDispatch(action, getState)
    )
  }
}

export default createWatchCreateDispatch
