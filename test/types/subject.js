import { PropTypes } from 'react'
import { Schema, arrayOf } from 'normalizr'

import { callApi } from '../../src'

export const collection = 'subject'

const subjectSchema = new Schema(collection)
export const schema = arrayOf(subjectSchema)

export const fetch = ({ subjectId }) => {
  if (subjectId === 'all') subjectId = ''
  return callApi(`subjects/${subjectId}`, schema)
}

export default PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
})
