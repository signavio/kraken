import { PropTypes } from 'react'
import { Schema } from 'normalizr'

import { callApi } from '../../../src'

import { API_ROOT } from '../../config'

const collection = 'subject'

const schema = new Schema(collection)

const fetch = ({ subjectId }) => {
  if (subjectId === 'all') subjectId = ''
  return callApi(`${API_ROOT}/subjects/${subjectId}`, schema)
}

const create = ({ body, options }) =>
  callApi(`${API_ROOT}/subjects`, schema, { body, method: 'POST', ...options })

const update = ({ body, options }) =>
callApi(`${API_ROOT}/subjects/${body.id}`, schema, { body, method: 'PUT', ...options })

const remove = ({ subjectId, options }) =>
  callApi(`${API_ROOT}/subjects/${subjectId}`, schema, { method: 'DELETE', ...options })


const shape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
})

export default shape

export {
  collection,
  schema,
  fetch,
  create,
  update,
  remove,
  shape,
}
