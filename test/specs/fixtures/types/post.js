// @flow
import { schema as schemas } from 'normalizr'

import { callApi, cachePolicies } from '../../../../src'

export const collection = 'posts'

export const schema = new schemas.Entity(collection)

export const fetch = ({ id }: { id: string }) => callApi(`/posts/${id}`)

export const create = (body: JSON) => callApi('/posts/', schemas.Entity, { method: 'POST', body })

export const cachePolicy = {
  updateEntityOnAction: cachePolicies.removeOnRemoveDispatch
}