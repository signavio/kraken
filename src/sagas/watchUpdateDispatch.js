import { isNil, omitBy } from 'lodash'
import { call, put } from 'redux-saga/effects'

import createActionCreators, { actionTypes } from '../actions'
import callApi from '../callApi'
import { Action, ApiTypeMap, UpdateDispatchAction } from '../flowTypes'
import { getUpdate } from '../types'
import {
  deriveRequestIdFromAction,
  stringifyQuery,
  takeLatestOfEvery,
} from '../utils'

export function createUpdateDispatch(types: ApiTypeMap) {
  const actions = createActionCreators(types)

  return function* updateEntity(action: UpdateDispatchAction, getState) {
    const requestId = deriveRequestIdFromAction(action)
    const entityType = action.payload.entityType

    const createUpdate = getUpdate(types, entityType)

    const { headers, credentials, apiBase } = getState().kraken.metaData

    const update = createUpdate(
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
      update,
      action.payload.query,
      action.payload.body,
      action.payload.requestParams
    )

    if (result.error == null) {
      yield put(
        actions.succeedUpdate({
          entityType,
          requestId,
          value: result.response?.result,
          entities: result.response?.entities || {},
        })
      )
    } else {
      yield put(
        actions.failUpdate({
          entityType,
          requestId,
          ...omitBy({ error: result.error, status: result.status }, isNil),
        })
      )
    }
  }
}

const mapActionToEntity = ({ type, payload = {} }: Action) => {
  if (type !== actionTypes.UPDATE_DISPATCH) {
    return false
  }
  const { entityType, query } = payload
  return `${entityType}_${stringifyQuery(query)}`
}

export default function createWatchUpdateDispatch(types: ApiTypeMap) {
  const updateDispatch = createUpdateDispatch(types)

  return function* watchUpdateDispatch(getState) {
    yield takeLatestOfEvery(mapActionToEntity, (action) =>
      updateDispatch(action, getState)
    )
  }
}
