// @flow
import { schema as schemas } from 'normalizr'

import { callApi, cachePolicies } from '../../../../src'

import { schema as commentSchema } from './comment'

export const collection = 'posts'

export const schema = new schemas.Entity(collection, {
  comments: [commentSchema],
})

export const fetch = ({ id }: { id: string }) => callApi(`/posts/${id}`)

export const create = (_: any, body: JSON) =>
  callApi('/posts/', schema, { method: 'POST', body })

export const update = ({ id }: { id: string }, body: JSON) =>
  callApi(`/posts/${id}`, schema, { method: 'PUT', body })

export const remove = ({ id }: { id: string }) =>
  callApi(`/posts/${id}`, schema, { method: 'DELETE' })

export const cachePolicy = {
  updateEntityOnAction: cachePolicies.removeOnRemoveDispatch,
}
