import invariant from 'invariant'
import { mapValues } from 'lodash'

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
  fetchEntity(entity, query, refresh, requiredFields) {
    return {
      type: FETCH_ENTITY,
      payload: {
        entity,
        query,
        refresh,
        requiredFields,
      },
    }
  },

  cacheHit(entity, query, value) {
    return {
      type: CACHE_HIT,
      payload: {
        entity,
        query,
        value,
      },
    }
  },

  updateEntity(entity, query, body) {
    return {
      type: UPDATE_ENTITY,
      payload: {
        entity,
        query,
        body,
      },
    }
  },

  removeEntity(entity, query) {
    return {
      type: REMOVE_ENTITY,
      payload: {
        entity,
        query,
      },
    }
  },

  createEntity(entity, requestId, body) {
    return {
      type: CREATE_ENTITY,
      payload: {
        entity,
        requestId,
        body,
      },
    }
  },

  request(entity, requestId) {
    return {
      type: REQUEST,
      payload: {
        entity,
        requestId,
      },
    }
  },

  success(entity, requestId, value, entities) {
    return {
      type: SUCCESS,
      payload: {
        entity,
        requestId,
        value,
        entities,
      },
    }
  },

  failure(entityType, requestId, error) {
    return {
      type: FAILURE,
      payload: {
        entity: entityType,
        requestId,
        error,
      },
      error: true,
    }
  },
}


const enhanceWithEntityTypeValidation = (types, actionCreator, actionCreatorName) =>
  (entity, ...args) => {
    invariant(
      !!types[entity],
      `First argument of ${actionCreatorName} action creator must be one of the following constants:
      \`${Object.keys(types).join(', ')}\`
      (is: \`${entity}\`)`
    )

    return actionCreator(entity, ...args)
  }


export default (types) => mapValues(
  actionCreators,
  enhanceWithEntityTypeValidation.bind(null, types)
)
