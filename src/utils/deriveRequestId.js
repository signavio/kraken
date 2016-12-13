// TODO: maybe switch to a proper hashing to make sure to not have key
// collision when queries with different key sets are used for the same type
const stringifyQuery = (query) => JSON.stringify(query)

export default (method, { query, elementId, propName }) => (
  method === 'create'
    ? `create_${elementId}_${propName}`
    : `${method}_${stringifyQuery(query)}`
)
