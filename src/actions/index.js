import invariant from 'invariant'

export const LOAD_ENTITY = 'API_LOAD_ENTITY'
export const BATCHED_REQUEST = 'API_BATCHED_REQUEST'
export const CACHE_HIT = 'API_CACHE_HIT'
export const REQUEST = 'API_REQUEST'
export const SUCCESS = 'API_SUCCESS'
export const FAILURE = 'API_FAILURE'

export default (types) => ({
  // If requiredFields is set to `true` the entity will always be refetched,
  // even it is already in the cache,
  loadEntity: (entityType, query, requiredFields) => {
    invariant(
      !!types[entityType],
`First argument of loadEntity action creator must be one of the following constants:
\`${Object.keys(types).join(', ')}\`
(is: \`${entityType}\`)
`)
    return {
      type: LOAD_ENTITY,
      payload: {
        entity: entityType,
        query,
        requiredFields,
      },
    }
  },

  batchedRequest: () => ({
    type: BATCHED_REQUEST,
  }),

  cacheHit: (type, query, value) => ({
    type: CACHE_HIT,
    payload: {
      entity: type,
      query,
      value,
    },
  }),

  request: (type, query) => ({
    type: REQUEST,
    payload: {
      entity: type,
      query,
    },
  }),

  success: (type, query, value, entities) => ({
    type: SUCCESS,
    payload: {
      entity: type,
      query,
      value,
      entities,
    },
  }),

  failure: (type, query, error) => ({
    type: FAILURE,
    payload: {
      entity: type,
      query,
      error,
    },
    error: true,
  }),
})
