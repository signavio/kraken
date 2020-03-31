// @flow
import { schema as schemas } from 'normalizr'

import { cachePolicies } from '../../../../src'
import { type CallApi } from '../../../../src/flowTypes'
import { schema as commentSchema } from './comment'

export const collection = 'posts'

export const schema = new schemas.Entity(collection, {
  comments: [commentSchema],
})

export const fetch = (callApi: CallApi) => ({ id }: { id: string }) =>
  callApi(`/posts/${id}`, schema)

export const create = (callApi: CallApi) => (_: any, body: JSON) =>
  callApi('/posts/', schema, { method: 'POST', body })

export const update = (callApi: CallApi) => (
  { id }: { id: string },
  body: JSON
) => callApi(`/posts/${id}`, schema, { method: 'PUT', body })

export const remove = (callApi: CallApi) => ({ id }: { id: string }) =>
  callApi(`/posts/${id}`, schema, { method: 'DELETE' })

export const cachePolicy = {
  updateEntityOnAction: cachePolicies.removeOnRemoveDispatch,
}
