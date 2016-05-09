import { Schema } from 'normalizr'
import { callApi } from '@signavio/generic-api'

export const collection = 'users'

export const schema = new Schema(collection)

export const fetch = ({ id }) => callApi(`users/${id}`, schema)
