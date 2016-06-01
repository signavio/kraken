import { PropTypes } from 'react'
import { arrayOf } from 'normalizr'

import { callApi } from '../../../src'

import { API_ROOT } from '../../config'

import SubjectTyp, {
  schema as SubjectSchema,
  collection,
} from './subject'

const schema = arrayOf(SubjectSchema)
const fetch = ({ options }) => callApi(`${API_ROOT}/subjects`, schema, options)

export default PropTypes.arrayOf(SubjectTyp)

export {
  collection,
  schema,
  fetch,
}
