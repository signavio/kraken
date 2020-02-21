// @flow
import {
  type Query,
  type RequestMethod,
  type RequestParams,
} from '../flowTypes'
import stringifyQuery from './stringifyQuery'

const getRequestId = (
  method: RequestMethod,
  query: ?Query,
  requestParams: ?RequestParams,
  elementId?: string
): string => {
  const stringifiedQuery = stringifyQuery({
    ...query,
    ...requestParams,
  })

  if (elementId) {
    return `${method}_${stringifiedQuery}_${elementId}`
  }

  return `${method}_${stringifiedQuery}`
}

export default getRequestId
