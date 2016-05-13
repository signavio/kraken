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

const shape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
})

export default shape

export {
  collection,
  schema,
  fetch,
  shape,
}
