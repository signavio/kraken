import { put, call } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import { createFetchDispatch } from '../../../src/sagas/watchFetchDispatch'

import actionsCreator from '../../../src/actions'
import { deriveRequestIdFromAction } from '../../../src/utils'
import { typeUtils } from '../../../src'

import expect from '../../expect'

import { apiTypes, types, data } from '../fixtures'

const fetchEntity = createFetchDispatch(apiTypes)
const actions = actionsCreator(apiTypes)

const fetchAction = { type: 'FETCH_DISPATCH', payload: { entityType: types.USER, query: { id: 'user-1' } } }
const requestId = deriveRequestIdFromAction(fetchAction)

const state = {
  genericApi: {
    requests: {
      [types.USER]: {
        [requestId]: {
          outstanding: true,
        },
      },
    },
    entities: {
      [types.USER]: {
      },
    },
  },
}

const getState = () => state

describe('Saga - fetchEntity', () => {
  describe('Cached', () => {
    it('should call `fetchEntity` the entity is not already cached')
    it('should dispatch a `cacheHit` action if the entity is already in the cache')
  })

  let generator

  beforeEach(() => {
    generator = fetchEntity(fetchAction, getState)
  })

  it('should call the `fetch` function of the entity type passing in the query object', () => {
    expect(generator.next().value).to.deep.equal(
      call(typeUtils.getFetch(apiTypes, types.USER), fetchAction.payload.query)
    )
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()

    const { result, entities } = normalize(data.user, apiTypes.USER.schema)

    expect(generator.next({ response: { result, entities } }).value).to.deep.equal(
      put(actions.succeedFetch({
        entityType: types.USER,
        requestId,
        value: result,
        entities,
        isCachedResponse: false,
      }))
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value)
      .to.deep.equal(put(actions.failFetch({ entityType: types.USER, requestId, error })))
  })
})
