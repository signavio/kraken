import { Schema } from 'normalizr'

import { callApi } from '../../../../src'

export const collection = 'users'

export const schema = new Schema(collection)

export const fetch = ({ id }) => callApi(`/users/${id}`)

export const create = (body) => callApi('/users/', Schema, { method: 'POST', body })
