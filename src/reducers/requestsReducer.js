import { startsWith } from 'lodash'

import { actionTypes } from '../actions'
import { Action, ApiTypeMap, RequestsState } from '../flowTypes'
import { getMethodName, getRequestId } from '../utils'

const requestsReducer = (state: RequestsState, action: Action) => {
  const { payload = {} } = action

  switch (action.type) {
    case actionTypes.FETCH_DISPATCH:
    case actionTypes.CREATE_DISPATCH:
    case actionTypes.UPDATE_DISPATCH:
    case actionTypes.REMOVE_DISPATCH:
      const key = getRequestId(
        getMethodName(action),
        payload.query,
        payload.requestParams,
        payload.elementId
      )

      const request = state[key] || {}

      const needsRefresh =
        payload.refresh && request.refresh !== payload.refresh

      if (request.pending && !needsRefresh) {
        return state
      }

      return {
        ...state,
        [key]: {
          ...request,
          outstanding: true,
          query: payload.query,
          body: payload.body,
          requestParams: payload.requestParams,
          fulfilled: false,
          pending: true,
          refresh:
            payload.refresh !== undefined ? payload.refresh : request.refresh,
          value: needsRefresh ? undefined : request.value,
          reason: null,
          status: null,
        },
      }
    case actionTypes.REQUEST_START:
      return {
        ...state,
        [payload.requestId]: {
          ...state[payload.requestId],
          outstanding: false,
        },
      }
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.REMOVE_SUCCESS:
      return {
        ...state,
        [payload.requestId]: {
          ...state[payload.requestId],
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
          responseHeaders: payload.responseHeaders,
          reason: null,
          status: payload.status,
        },
      }
    case actionTypes.FETCH_FAILURE:
    case actionTypes.CREATE_FAILURE:
    case actionTypes.UPDATE_FAILURE:
    case actionTypes.REMOVE_FAILURE:
      return {
        ...state,
        [payload.requestId]: {
          ...state[payload.requestId],
          pending: false,
          fulfilled: false,
          rejected: true,
          reason: payload.error,
          status: payload.status,
        },
      }
    default:
      return state
  }
}

const createRequestsReducer = (apiTypes: ApiTypeMap, typeConstant) => (
  state: State = {},
  action: Action
) => {
  if (!startsWith(action.type, '@@kraken/')) {
    return state
  }

  const { payload = {} } = action
  if (payload.entityType !== typeConstant) {
    return state
  }
  return requestsReducer(state, action)
}

export default createRequestsReducer
