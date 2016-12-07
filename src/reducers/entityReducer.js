import { keys, omitBy, every } from 'lodash'

import { getCollection } from '../types'

import {
  REMOVE_ENTITY,
  SUCCESS,
} from '../actions'

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
  every(obj2, (key) => obj1[key] === obj2[key])
)

export default (apiTypes, typeConstant) => (state = {}, action) => {
  const { payload = {} } = action

  if (payload.entity !== typeConstant) return state

  switch (action.type) {
    case SUCCESS:
      const entities = payload.entities && payload.entities[getCollection(apiTypes, typeConstant)]
      return entities ? mergeValues(state, entities) : state
    case REMOVE_ENTITY:
      return omitBy(state, (value) => hasAllPropertiesOf(value, payload.query))
    default:
      return state
  }
}
