import { normalize } from 'normalizr'

import { apiTypes as types } from '../types'

import caseData from './cases/new-p1'
import subjectData from './subjects/new-p1'
import traceData from './traces/new-p1'

const Cases = { response: normalize(caseData, types.Cases.schema) }
const Traces = { response: normalize(traceData, types.Traces.schema) }
const Subjects = { response: normalize(subjectData, types.Subjects.schema) }
const Case = { response: normalize(caseData[0], types.Case.schema) }
const Trace = { response: normalize(traceData[0], types.Trace.schema) }
const Subject = { response: normalize(subjectData[0], types.Subject.schema) }

export {
  Cases,
  Traces,
  Subjects,
  Case,
  Trace,
  Subject,
}
