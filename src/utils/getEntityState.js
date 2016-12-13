import { hasEntitySchema } from '../types'

import getEntityCollectionState from './getEntityCollectionState'
import getCachedValue from './getCachedValue'

export default (types, state, type, method, payload) => {
  const entityCollection = getEntityCollectionState(types, state, type)
  const value = getCachedValue(types, state, type, method, payload)

  if (hasEntitySchema(types, type)) {
    return value && entityCollection[value]
  }

  // array type: map ids in promise value to entities
  return value && value.map((id) => entityCollection[id])
}
