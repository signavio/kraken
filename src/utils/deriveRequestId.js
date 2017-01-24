import { chain } from 'lodash'

const stringifyQuery = (query) => {
  const stringifiedQuery = chain(query)
    .toPairs()
    .sort()
    .reduce(
      (previous, current) =>
        previous + JSON.stringify(current),
      ''
    )
    .value()

  return btoa(stringifiedQuery)
}

export default ({ method, query, ...options }) => {
  const stringifiedQuery = stringifyQuery(query)

  if (method === 'create') {
    return `${method}_${stringifiedQuery}_${options.elementId}`
  }

  return `${method}_${stringifiedQuery}`
}
