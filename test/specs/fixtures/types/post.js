// @flow
import { schema as schemas } from 'normalizr'

import { callApi, cachePolicies } from '../../../../src'

import { schema as commentSchema } from './comment'

export const collection = 'posts'

export const schema = new schemas.Entity(collection, {
  comments: [commentSchema],
})

export const fetch = ({ id }: { id: string }) => callApi(`/posts/${id}`)

export const create = (_, body: JSON) =>
  callApi('/posts/', schemas.Entity, { method: 'POST', body })

export const cachePolicy = {
  updateEntityOnAction: cachePolicies.removeOnRemoveDispatch,
}
