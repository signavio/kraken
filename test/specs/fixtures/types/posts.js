// @flow
import { schema as schemas } from 'normalizr'
import { keys } from 'normalizr'

import { callApi } from '../../../../src'
import { cachePolicies } from '../../../../src'

import { schema as baseSchema } from './post'

export { collection } from './post'

export const schema = new schemas.Array(baseSchema)

export const fetch = ({ category, author }) => callApi([
	'posts',
	category ? `/${category}` : '',
	author ? `?author=${author}` : '',
].join(''))

export const cachePolicy = {
	updateRequestOnCollectionChange: cachePolicies.matchCachedWithQuery,
}