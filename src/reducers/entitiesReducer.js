import { keys, pickBy, isNil, startsWith } from 'lodash'

import { getCollectionName } from '../types'
import { actionTypes } from '../actions'

const mergeValues = (obj1, obj2) =>
  keys(obj2).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...(acc[key] || {}),
        ...obj2[key],
      },
    }),
    obj1
  )

export default (apiTypes, typeConstant) => (state = {}, action) => {
  if (!startsWith(action.type, '@@kraken/')) {
    return state
  }

  const { payload = {} } = action
  const entities =
    payload.entities &&
    payload.entities[getCollectionName(apiTypes, typeConstant)]

  switch (action.type) {
    case actionTypes.UPDATE_DISPATCH:
      if (payload.entityType !== typeConstant) return state
      // remove empty props in cache coming from body
      return {
        ...state,
        [payload.body.id]: {
          ...state[payload.body.id],
          ...pickBy(payload.body, isNil),
        },
      }
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.REMOVE_SUCCESS:
      return entities ? mergeValues(state, entities) : state
    default:
      return state
  }
}
