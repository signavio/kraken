// @flow
import invariant from 'invariant'
import { intersection } from 'lodash'

import type {
  ApiTypeMap,
  EntityCollectionT,
  EntityType,
  Request,
} from '../flowTypes'
import { hasEntitySchema } from '../types'

// clean result values from ids that are no longer existent in the cache
const removeDeleted = (
  apiTypes: ApiTypeMap,
  request: Request,
  collection: EntityCollectionT,
  entityType: EntityType
) => {
  const { value } = request

  if (!value) {
    return request
  }

  if (hasEntitySchema(apiTypes, entityType)) {
    invariant(
      typeof value === 'string',
      `Expected a string value but got "${typeof value}".`
    )

    const isInCollection = !!collection[value]

    return isInCollection ? request : { ...request, value: undefined }
  }

  invariant(
    Array.isArray(value),
    `Expected a list value but got "${typeof value}".`
  )

  const existingIds = intersection(request.value, Object.keys(collection))

  return existingIds.length === value.length
    ? request
    : {
        ...request,
        value: existingIds,
      }
}

export default {
  updateRequestOnCollectionChange: removeDeleted,
}
