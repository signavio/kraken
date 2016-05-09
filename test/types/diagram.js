import { Schema } from 'normalizr'
import { callApi } from '../../src'


export const collection = 'diagram'

export const schema = new Schema(collection)

export const fetch = ({ id }) => callApi(`diagrams/${id}`, schema)
