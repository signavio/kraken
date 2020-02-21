// @flow
import { type Query } from '../flowTypes'

const stringifyQuery = (query: Query): string =>
  [
    '[',
    Object.entries(query)
      .sort()
      .reduce((previous, current) => [...previous, JSON.stringify(current)], [])
      .join(','),
    ']',
  ].join('')

export default stringifyQuery
