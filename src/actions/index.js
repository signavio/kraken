import invariant from 'invariant'

export const actionTypes = {
  LOAD_ENTITY: 'API_LOAD_ENTITY',
  BATCHED_REQUEST: 'API_BATCHED_REQUEST',
  CACHE_HIT: 'API_CACHE_HIT',
  REQUEST: 'API_REQUEST',
  SUCCESS: 'API_SUCCESS',
  FAILURE: 'API_FAILURE',
}

export default (types) => ({
  ...actionTypes,
  // If requiredFields is set to `true` the entity will always be refetched,
  // even it is already in the cache,
  loadEntity: (entityType, query, requiredFields) => {
    invariant(
      !!types[entityType],
      'First argument of loadEntity action creator must be one of the following constants: ' +
      Object.keys(types).join(', ') + ' (is: ' + entityType + ')'
    )
    return {
      type: actionTypes.LOAD_ENTITY,
      payload: {
        entity: entityType,
        query,
        requiredFields,
      },
    }
  },

  batchedRequest: () => ({
    type: actionTypes.BATCHED_REQUEST,
  }),

  cacheHit: (type, query, value) => ({
    type: actionTypes.CACHE_HIT,
    payload: {
      entity: type,
      query,
      value,
    },
  }),

  request: (type, query) => ({
    type: actionTypes.REQUEST,
    entity: type,
    payload: {
      query,
    },
  }),

  success: (type, query, value, entities) => ({
    type: actionTypes.SUCCESS,
    payload: {
      entity: type,
      query,
      value,
      entities,
    },
  }),

  failure: (type, query, error) => ({
    type: actionTypes.FAILURE,
    payload: {
      entity: type,
      query,
      error,
    },
    error: true,
  }),
})
