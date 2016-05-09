import { normalize, arrayOf } from 'normalizr'

import types from '../types'

import caseData from './cases/new-p1'
import subjectData from './subjects/p1'
import traceData from './traces/new-p1'
// import Diagram from './diagrams/p1'
// import Deviation from './deviations/p1'
// import Status from './status/p1'

export const Case = {
  response: normalize(caseData, types.Case.schema),
}
export const Trace = {
  response: normalize(traceData, types.Trace.schema),
}
export const Subject = {
  response: normalize(subjectData, types.Subject.schema),
}
// export const diagram = {
//   response: normalize(diagramData, diagramSchema),
// }
// export const deviations = {
//   response: normalize(deviationsData, deviationsSchema),
// }
// export const status = {
//   response: normalize(statusData, statusSchema),
// }
// export const process = {
//   response: normalize(_.find(processData, (o) => o.id === 'p1'), processSchema),
// }
