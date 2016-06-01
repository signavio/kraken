import invariant from 'invariant'
import mapValues from 'lodash/mapValues'
import uniqueId from 'lodash/uniqueId'

export const LOAD_ENTITY = 'API_LOAD_ENTITY'
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

  createEntity: (entityType, body) => ({
    type: CREATE_ENTITY,
    payload: {
      entity: entityType,
      body,
      requestId: uniqueId('create_'),
    },
  }),

  updateEntity: (entityType, body) => ({
    type: UPDATE_ENTITY,
    payload: {
      entity: entityType,
      body,
      requestId: uniqueId('update_'),
    },
  }),

  removeEntity: (entityType, id) => ({
    type: REMOVE_ENTITY,
    payload: {
      entity: entityType,
      id,
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
