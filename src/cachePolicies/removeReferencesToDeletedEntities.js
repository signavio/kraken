// @flow
import { keys, intersection } from 'lodash'

import type { Request, EntityCollectionT } from '../internalTypes'

// clean result values from ids that are no longer existent in the cache
const removeDeleted = (request: Request, collection: EntityCollectionT) => {
  if (!request.value) {
    return request
  }
  const existingIds = intersection(request.value, keys(collection))
  return existingIds.length === request.value.length
    ? request
    : {
        ...request,
        value: existingIds,
      }
}

export default {
  updateRequestOnCollectionChange: removeDeleted,
}
