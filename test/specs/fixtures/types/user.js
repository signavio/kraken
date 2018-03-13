// @flow
import { schema as schemas } from 'normalizr'

import { callApi } from '../../../../src'
import { schema as postSchema } from './post'

export const collection = 'users'

export const schema = new schemas.Entity(collection, {
  posts: [postSchema],
})

export const fetch = ({ id }: { id: string }) => callApi(`/users/${id}`)

export const create = (_: any, body: JSON) =>
  callApi('/users/', schemas.Entity, { method: 'POST', body })
