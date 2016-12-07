import { deriveRequestIdFromAction } from '../utils'
import {
  FETCH_ENTITY,
  CACHE_HIT,
  CREATE_ENTITY,
  UPDATE_ENTITY,
  REMOVE_ENTITY,
  REQUEST,
  SUCCESS,
  FAILURE,
} from '../actions'

export default (apiTypes, typeConstant) => (state = {}, action) => {
  const { payload = {} } = action
  if (payload.entity !== typeConstant) return state

  const key = deriveRequestIdFromAction(action)
  const promise = state[key] || {}

  switch (action.type) {
    case FETCH_ENTITY:
    case CREATE_ENTITY:
    case UPDATE_ENTITY:
    case REMOVE_ENTITY:
      const needsRefresh = payload.refresh && promise.refresh !== payload.refresh
      return promise.pending && !needsRefresh ? state : {
        ...state,
        [key]: {
          ...promise,
          outstanding: true,
          pending: true,
          refresh: payload.refresh || promise.refresh,
          value: needsRefresh ? undefined : promise.value,
        },
      }
    case CACHE_HIT:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: false,
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
        },
      }
    case REQUEST:
      return {
        ...state,
        [key]: {
          ...promise,
          outstanding: false,
          ...(promise && promise.fulfilled && { refreshing: true }),
        },
      }
    case SUCCESS:
      return {
        ...state,
        [key]: {
          ...promise,
          pending: false,
          fulfilled: true,
          rejected: false,
          value: payload.value,
        },
      }
    case FAILURE:
      return {
        ...state,
        [key]: {
          ...promise,
          pending: false,
          fulfilled: false,
          rejected: true,
          reason: payload.error,
        },
      }
    default:
      return state
  }
}
