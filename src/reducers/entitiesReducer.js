import { keys, omitBy, every } from 'lodash'

import { getCollectionName } from '../types'

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
    case 'FETCH_SUCCESS':
    case 'CREATE_SUCCESS':
    case 'UPDATE_SUCCESS':
    case 'REMOVE_SUCCESS':
      return entities ? mergeValues(state, entities) : state
    case 'REMOVE_DISPATCH':
      return omitBy(state, (value) => hasAllPropertiesOf(value, payload.query))
    default:
      return state
  }
}
