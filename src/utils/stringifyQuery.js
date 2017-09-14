import { chain } from 'lodash'

const stringifyQuery = query =>
  chain(query)
    .toPairs()
    .sort()
    .reduce((previous, current) => previous + JSON.stringify(current), '')
    .value()

export default stringifyQuery
