import { keys, omitBy, every } from 'lodash'

import { getCollectionName } from '../types'
import { actionTypes } from '../actions'

const mergeValues = (obj1, obj2) => (
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
)

export default (apiTypes, typeConstant) => (state = {}, action) => {
  const { payload = {} } = action
  const entities = payload.entities && payload.entities[getCollectionName(apiTypes, typeConstant)]

  if (payload.entityType !== typeConstant) return state

  switch (action.type) {
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.REMOVE_SUCCESS:
      return entities ? mergeValues(state, entities) : state
    default:
      return state
  }
}
