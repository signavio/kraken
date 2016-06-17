import invariant from 'invariant'
import mapValues from 'lodash/mapValues'

export const FETCH_ENTITY = 'API_FETCH_ENTITY'
export const CREATE_ENTITY = 'API_CREATE_ENTITY'
export const UPDATE_ENTITY = 'API_UPDATE_ENTITY'
export const REMOVE_ENTITY = 'API_REMOVE_ENTITY'

export const CACHE_HIT = 'API_CACHE_HIT'

export const REQUEST = 'API_REQUEST'
export const SUCCESS = 'API_SUCCESS'
export const FAILURE = 'API_FAILURE'

const actionCreators = {

  // If requiredFields is set to `true` the entity will always be refetched,
  // even it is already in the cache,
  fetchEntity: (entityType, query, refresh, requiredFields) => ({
    type: FETCH_ENTITY,
    payload: {
      entity: entityType,
      query,
      refresh,
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

  updateEntity: (entityType, query, body) => ({
    type: UPDATE_ENTITY,
    payload: {
      entity: entityType,
      query,
      body,
    },
  }),

  removeEntity: (entityType, query) => ({
    type: REMOVE_ENTITY,
    payload: {
      entity: entityType,
      query,
    },
  }),

  createEntity: (entityType, requestId, body) => ({
    type: CREATE_ENTITY,
    payload: {
      entity: entityType,
      requestId,
      body,
    },
  }),

  request: (entityType, requestId) => ({
    type: REQUEST,
    payload: {
      entity: entityType,
      requestId,
    },
  }),

  success: (entityType, requestId, value, entities) => ({
    type: SUCCESS,
    payload: {
      entity: entityType,
      requestId,
      value,
      entities,
    },
  }),

  failure: (entityType, requestId, error) => ({
    type: FAILURE,
    payload: {
      entity: entityType,
      requestId,
      error,
    },
    error: true,
  }),

}


const enhanceWithEntityTypeValidation = (types, actionCreator, actionCreatorName) => (entityType, ...args) => {
  invariant(
    !!types[entityType],
`First argument of ${actionCreatorName} action creator must be one of the following constants:
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
