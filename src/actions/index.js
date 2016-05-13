import invariant from 'invariant'
import mapValues from 'lodash/mapValues'

export const LOAD_ENTITY = 'API_LOAD_ENTITY'
export const CACHE_HIT = 'API_CACHE_HIT'
export const FETCH = 'API_FETCH'
export const CREATE = 'API_CREATE'
export const UPDATE = 'API_UPDATE'
export const SUCCESS = 'API_SUCCESS'
export const FAILURE = 'API_FAILURE'

const actionCreators = {

  // If requiredFields is set to `true` the entity will always be refetched,
  // even it is already in the cache,
  loadEntity: (entityType, query, requiredFields) => ({
    type: LOAD_ENTITY,
    payload: {
      entity: entityType,
      query,
      requiredFields,
    },
  }),

  cacheHit: (entityType, query, value) => ({
    type: CACHE_HIT,
    payload: {
      entity: entityType,
      query,
      value,
    },
  }),

  fetch: (entityType, query) => ({
    type: FETCH,
    payload: {
      entity: entityType,
      query,
    },
  }),

  create: (entityType, requestId, body) => ({
    type: CREATE,
    payload: {
      entity: entityType,
      requestId,
      body,
    },
  }),

  update: (entityType, requestId, body) => ({
    type: UPDATE,
    payload: {
      entity: entityType,
      requestId,
      body,
    },
  }),

  success: (entityType, query, value, entities) => ({
    type: SUCCESS,
    payload: {
      entity: entityType,
      query,
      value,
      entities,
    },
  }),

  failure: (entityType, query, error) => ({
    type: FAILURE,
    payload: {
      entity: entityType,
      query,
      error,
    },
    error: true,
  }),

}


const enhanceWithEntityTypeValidation = (types, actionCreator) => (entityType, ...args) => {
  invariant(
    !!types[entityType],
`First argument of loadEntity action creator must be one of the following constants:
\`${Object.keys(types).join(', ')}\`
(is: \`${entityType}\`)
`
  )
  return actionCreator(entityType, ...args)
}

export default (types) => mapValues(
  actionCreators,
  enhanceWithEntityTypeValidation.bind(null, types)
)
