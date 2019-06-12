// @flow
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import type {
  ApiTypeMap,
  EntityCollectionT,
  EntityType,
  Request,
} from '../internalTypes'
import { hasEntitySchema } from '../types'
import { isMatch } from '../utils'

// match cached entities' properties with query params and keep the result up-to-date with cache
const selectMatchingItemsAsValue = (
  apiTypes: ApiTypeMap,
  request: Request,
  collection: EntityCollectionT,
  entityType: EntityType
): Request => {
  if (hasEntitySchema(apiTypes, entityType)) {
    const matchingId: ?string = Object.keys(collection).find((id: string) =>
      isMatch(collection[id], request.query)
    )

    if (!request.value) {
      // $FlowFixMe
      return {
        ...request,
        value: matchingId,
      }
    }

    return request.value === matchingId
      ? request
      : // $FlowFixMe
        { ...request, value: matchingId }
  } else {
    const matchingIds = Object.keys(collection).filter((id: string) =>
      isMatch(collection[id], request.query)
    )

    if (!request.value) {
      // $FlowFixMe
      return {
        ...request,
        value: matchingIds,
      }
    }

    return shallowEqual(matchingIds, request.value || [])
      ? request
      : // $FlowFixMe
        {
          ...request,
          value: matchingIds,
        }
  }
}

export default {
  updateRequestOnCollectionChange: selectMatchingItemsAsValue,
}
