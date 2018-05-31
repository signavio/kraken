// @flow
import { keys, intersection } from 'lodash'

import type {
  Request,
  EntityCollectionT,
  ApiTypeMap,
  EntityType,
} from '../internalTypes'

import { hasEntitySchema } from '../types'

// clean result values from ids that are no longer existent in the cache
const removeDeleted = (
  apiTypes: ApiTypeMap,
  request: Request,
  collection: EntityCollectionT,
  entityType: EntityType
) => {
  if (!request.value) {
    return request
  }

  if (hasEntitySchema(apiTypes, entityType)) {
    const isInCollection = !!collection[request.value]

    return isInCollection ? request : { ...request, value: undefined }
  } else {
    const existingIds = intersection(request.value, keys(collection))
    return existingIds.length === request.value.length
      ? request
      : {
          ...request,
          value: existingIds,
        }
  }
}

export default {
  updateRequestOnCollectionChange: removeDeleted,
}
