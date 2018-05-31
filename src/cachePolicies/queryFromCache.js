// @flow
import { keys } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import type {
  Request,
  EntityCollectionT,
  ApiTypeMap,
  EntityType,
} from '../internalTypes'
import { isMatch } from '../utils'
import { hasEntitySchema } from '../types'

// match cached entities' properties with query params and keep the result up-to-date with cache
const selectMatchingItemsAsValue = (
  apiTypes: ApiTypeMap,
  request: Request,
  collection: EntityCollectionT,
  entityType: EntityType
): Request => {
  if (hasEntitySchema(apiTypes, entityType)) {
    const matchingId = keys(collection).find((id: string) =>
      isMatch(collection[id], request.query)
    )

    if (!request.value) {
      return {
        ...request,
        value: matchingId,
      }
    }

    return request.value === matchingId
      ? request
      : { ...request, value: matchingId }
  } else {
    const matchingIds = keys(collection).filter((id: string) =>
      isMatch(collection[id], request.query)
    )

    if (!request.value) {
      return {
        ...request,
        value: matchingIds,
      }
    }

    return shallowEqual(matchingIds, request.value || [])
      ? request
      : {
          ...request,
          value: matchingIds,
        }
  }
}

export default {
  updateRequestOnCollectionChange: selectMatchingItemsAsValue,
}
