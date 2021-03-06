// @flow
import { schema as schemas } from 'normalizr'

import { callApi } from '../../../../src'
import { cachePolicies } from '../../../../src'
import { schema as baseSchema } from './post'

export { collection } from './post'

export const schema = new schemas.Array(baseSchema)

type FetchPropsT = {
  category?: string,
  author?: string,
}

export const fetch = ({ category, author }: FetchPropsT) =>
  callApi(
    [
      'posts',
      category ? `/${category}` : '',
      author ? `?author=${author}` : '',
    ].join('')
  )

export const cachePolicy = {
  updateRequestOnCollectionChange: cachePolicies.matchCachedWithQuery,
}
