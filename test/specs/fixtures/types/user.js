// @flow
import { schema as schemas } from 'normalizr'

import { callApi } from '../../../../src'

export const collection = 'users'

export const schema = new schemas.Entity(collection)

export const fetch = ({ id }: { id: string }) => callApi(`/users/${id}`)

export const create = (body: JSON) => callApi('/users/', schemas.Entity, { method: 'POST', body })