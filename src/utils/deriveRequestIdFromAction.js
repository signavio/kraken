import { chain } from 'lodash'

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
  return action.type === 'CREATE_DISPATCH'
    || action.type === 'UPDATE_DISPATCH'
    || action.type === 'FETCH_DISPATCH'
    || action.type === 'REMOVE_DISPATCH'
}

const deriveRequestId = (action: DispatchAction) => {
  const stringifiedQuery = stringifyQuery(action.payload.query)
  const methodName = action.type.split('_')[0]
  let requestId: string

  if (action.type === 'CREATE_DISPATCH') {
    requestId = `${methodName}_${stringifiedQuery}_${action.payload.elementId}`
  } else {
    requestId = `${methodName}_${stringifiedQuery}`
  }

  return requestId
}

const deriveRequestIdFromAction = (action: Action) => {
  if (isDispatchAction(action)) {
    return deriveRequestId(action)
  } else {
    return action.payload.requestId
  }
}

export default deriveRequestIdFromAction
