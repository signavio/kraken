import { ApiTypeMap, State, Action } from '../internalTypes'

import { deriveRequestIdFromAction } from '../utils'
import { actionTypes } from '../actions'

const cacheReducer = (state: State, action: Action) => {
  const { payload = {} } = action
  const key = deriveRequestIdFromAction(action)
  const request = state[key] || {}

  let newState = { ...state }

  return newState
}

const directReducer = (state: State, action: Action) => {
  const { payload = {} } = action
  const key = deriveRequestIdFromAction(action)
  const request = state[key] || {}
  const needsRefresh = payload.refresh && request.refresh !== payload.refresh

  let newState = { ...state }

  switch (action.type) {
    case actionTypes.FETCH_DISPATCH:
    case actionTypes.CREATE_DISPATCH:
    case actionTypes.UPDATE_DISPATCH:
    case actionTypes.REMOVE_DISPATCH:
      if (!(request.pending && !needsRefresh)) {
        newState = {
          ...newState,
          [key]: {
            ...request,
            outstanding: true,
            pending: true,
            refresh: payload.refresh || request.refresh,
            value: needsRefresh ? undefined : request.value,
          },
        }
      } else {
        newState = {
          ...newState,
          [key]: {
            ...request,
            outstanding: false,
            ...(request && request.fulfilled && { refreshing: true }),
          },
        }
      }

      break
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.REMOVE_SUCCESS:
      newState = {
        ...newState,
        [key]: {
          ...request,
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
        },
      }

      break
    case actionTypes.FETCH_FAILURE:
    case actionTypes.CREATE_FAILURE:
    case actionTypes.UPDATE_FAILURE:
    case actionTypes.REMOVE_FAILURE:
      newState = {
        ...newState,
        [key]: {
          ...request,
          pending: false,
          fulfilled: false,
          rejected: true,
          reason: payload.error,
        },
      }

      break
  }

  return newState
}

const createRequestsReducer = (apiTypes: ApiTypeMap, typeConstant) => (state: State = {}, action: Action) => {
  const { payload = {} } = action

  if (payload.entityType !== typeConstant) return state

  let newState = { ...state }

  newState = directReducer(newState, action)
  newState = cacheReducer(newState, action)

  return newState
}

export default createRequestsReducer
