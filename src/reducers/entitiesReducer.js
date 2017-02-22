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

const hasAllPropertiesOf = (obj1, obj2) => (
  every(keys(obj2), (key) => obj1[key] === obj2[key])
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
    case actionTypes.REMOVE_DISPATCH:
      return omitBy(state, (value) => hasAllPropertiesOf(value, payload.query))
    default:
      return state
  }
}
