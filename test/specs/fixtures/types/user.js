// @flow
import { Schema } from 'normalizr'

import { callApi } from '../../../../src'

export const collection = 'users'

export const schema = new Schema(collection)

export const fetch = ({ id }: { id: string }) => callApi(`/users/${id}`)

export const create = (body: JSON) => callApi('/users/', Schema, { method: 'POST', body })
