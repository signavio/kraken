import { PropTypes } from 'react'
import { Schema, arrayOf } from 'normalizr'
import { callApi } from '../../src'

export const collection = 'trace'

const traceSchema = new Schema(collection)

export const schema = arrayOf(traceSchema)

export const fetch = ({ subjectId }) => callApi(`subjects/${subjectId}/traces/`, schema)

export default PropTypes.shape({
  traceId: PropTypes.string.isRequired,
  subjectId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  startActivity: PropTypes.string.isRequired,
  endActivity: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(PropTypes.string).isRequired,
})
