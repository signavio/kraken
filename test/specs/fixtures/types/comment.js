// @flow
import { schema as schemas } from 'normalizr'

import { type CallApi } from '../../../../src/flowTypes'

export const collection = 'comments'

export const schema = new schemas.Entity(collection)
schema.define({
  parent: schema,
})

export const fetch = (callApi: CallApi) => ({ id }: { id: string }) =>
  callApi(`/comments/${id}`, schema, { method: 'GET' })
