import { PropTypes } from 'react'
import { Schema, arrayOf } from 'normalizr'
import { callApi } from '../../src'

export const collection = 'case'

const caseSchema = new Schema(collection, { idAttribute: 'caseId' })
export const schema = arrayOf(caseSchema)

export const fetch = ({ subjectId }) => callApi(`subjects/${subjectId}/cases/`, schema)

export default PropTypes.shape({
  subjectId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  caseId: PropTypes.string.isRequired,
  traceId: PropTypes.string.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      activity: PropTypes.string.isRequired,
      caseId: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      payload: PropTypes.object.isRequired,
      timestamp: PropTypes.number.isRequired,
    })
  ),
})
