import { ApiTypeMap, State, Action } from '../internalTypes'

import { deriveRequestIdFromAction } from '../utils'

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
    case 'FETCH_DISPATCH':
    case 'CREATE_DISPATCH':
    case 'UPDATE_DISPATCH':
    case 'REMOVE_DISPATCH':
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
    case 'FETCH_SUCCESS':
    case 'CREATE_SUCCESS':
    case 'UPDATE_SUCCESS':
    case 'REMOVE_SUCCESS':
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
    case 'FETCH_FAILURE':
    case 'CREATE_FAILURE':
    case 'UPDATE_FAILURE':
    case 'REMOVE_FAILURE':
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
