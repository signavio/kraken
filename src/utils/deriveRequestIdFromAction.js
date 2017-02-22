import { chain } from 'lodash'

import { actionTypes } from '../actions'
import {
  Action,
  DispatchAction,
} from '../internalTypes'

const stringifyQuery = (query) => {
  const stringifiedQuery = chain(query)
    .toPairs()
    .sort()
    .reduce(
      (previous, current) => previous + JSON.stringify(current),
      ''
    )
    .value()

  return btoa(stringifiedQuery)
}

const isDispatchAction = (action: Action)/* : action is DispatchAction */ => {
  return action.type === actionTypes.CREATE_DISPATCH
    || action.type === actionTypes.UPDATE_DISPATCH
    || action.type === actionTypes.FETCH_DISPATCH
    || action.type === actionTypes.REMOVE_DISPATCH
}

const getMethodName = (action: Action) => {
  switch (action.type) {
    case actionTypes.FETCH_DISPATCH:
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.FETCH_FAILURE:
      return 'fetch'
    case actionTypes.CREATE_DISPATCH:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.CREATE_FAILURE:
      return 'create'
    case actionTypes.UPDATE_DISPATCH:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.UPDATE_FAILURE:
      return 'update'
    case actionTypes.REMOVE_DISPATCH:
    case actionTypes.REMOVE_SUCCESS:
    case actionTypes.REMOVE_FAILURE:
      return 'remove'
  }
}

const deriveRequestId = (action: DispatchAction): string => {
  const stringifiedQuery = stringifyQuery(action.payload.query)
  const methodName = getMethodName(action)
  return (action.type === actionTypes.CREATE_DISPATCH) ?
    `${methodName}_${stringifiedQuery}_${action.payload.elementId}` :
    `${methodName}_${stringifiedQuery}`
}

const deriveRequestIdFromAction = (action: Action) => {
  if (isDispatchAction(action)) {
    return deriveRequestId(action)
  } else {
    return action.payload.requestId
  }
}

export default deriveRequestIdFromAction
