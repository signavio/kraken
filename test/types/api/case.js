import { PropTypes } from 'react'
import { Schema } from 'normalizr'
import { callApi } from '../../../src'

import { API_ROOT } from '../../config'

const collection = 'case'

const schema = new Schema(collection)

const fetch = ({ subjectId, caseId, options }) =>
  callApi(`${API_ROOT}/subjects/${subjectId}/cases/${caseId}`, schema, options)

const shape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  subjectId: PropTypes.string.isRequired,
  traceId: PropTypes.string.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  activities: PropTypes.shape({
    events: PropTypes.arrayOf(
      PropTypes.shape({
        activity: PropTypes.string.isRequired,
        caseId: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        payload: PropTypes.object.isRequired,
        timestamp: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
})

export default shape

export {
  schema,
  fetch,
  collection,
  shape,
}
