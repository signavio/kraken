import { PropTypes } from 'react'
import { arrayOf } from 'normalizr'
import { callApi } from '../../../src'

import { API_ROOT } from '../../config'

import CaseTyp,
{
  schema as CaseSchema,
  collection,
} from './case'

const schema = arrayOf(CaseSchema)

const fetch = ({ subjectId }) => callApi(`${API_ROOT}/subjects/${subjectId}/cases/`, schema)

const shape = PropTypes.arrayOf(CaseTyp)

export default shape

export {
  schema,
  fetch,
  collection,
  shape,
}
