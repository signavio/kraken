import { PropTypes } from 'react'
import { Schema } from 'normalizr'
import { callApi } from '../../../src'

import { API_ROOT } from '../../config'

const collection = 'trace'

const schema = new Schema(collection)

const fetch = ({ subjectId, traceId }) =>
callApi(`${API_ROOT}/subjects/${subjectId}/traces/${traceId}`, schema)

const shape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  subjectId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  startActivity: PropTypes.string.isRequired,
  endActivity: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(PropTypes.string).isRequired,
})

export default shape

export {
  collection,
  schema,
  fetch,
}
