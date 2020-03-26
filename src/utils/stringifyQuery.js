import { toPairs, reduce } from 'lodash'

const stringifyQuery = (query) =>
  reduce(
    toPairs(query).sort(),
    (previous, current) => previous + JSON.stringify(current),
    ''
  )

export default stringifyQuery
