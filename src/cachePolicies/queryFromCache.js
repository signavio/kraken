// @flow
import { keys } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import type { Request, EntityCollectionT } from '../internalTypes'
import { isMatch } from '../utils'

// match cached entities' properties with query params and keep the result up-to-date with cache
const selectMatchingItemsAsValue = (
  request: Request,
  collection: EntityCollectionT
): Request => {
  const matchingIds = keys(collection).filter(id =>
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

export default {
  updateRequestOnCollectionChange: selectMatchingItemsAsValue,
}
