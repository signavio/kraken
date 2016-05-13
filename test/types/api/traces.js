import { PropTypes } from 'react'
import { arrayOf } from 'normalizr'
import { callApi } from '../../../src'

import TraceTyp,
{
  schema as TraceSchema,
  collection,
} from './trace'

import { API_ROOT } from '../../config'

const schema = arrayOf(TraceSchema)

const fetch = ({ subjectId }) => callApi(`${API_ROOT}/subjects/${subjectId}/traces/`, schema)

const shape = PropTypes.arrayOf(TraceTyp)

export default shape

export {
  schema,
  fetch,
  collection,
  shape,
}
