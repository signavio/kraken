// @flow
import { schema as schemas } from 'normalizr'

import { type CallApi } from '../../../../src/flowTypes'
import { schema as postSchema } from './post'

export const collection = 'users'

export const schema = new schemas.Entity(collection, {
  posts: [postSchema],
})

export const fetch = (callApi: CallApi) => ({ id }: { id: string }) =>
  callApi(`/users/${id}`, schema)

export const create = (callApi: CallApi) => (_: any, body: JSON) =>
  callApi('/users/', schema, { method: 'POST', body })

export const remove = (callApi: CallApi) => (_: any, body: JSON) =>
  callApi('/users/', schema, { method: 'DELETE', body })
