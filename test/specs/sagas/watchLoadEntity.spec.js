import { put, call } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import { createFetchEntity } from '../../../src/sagas/watchLoadEntity'

import actionsCreator from '../../../src/actions'
import { getPromiseState, deriveRequestId } from '../../../src/utils'
import { typeUtils } from '../../../src'

import expect from '../../expect'

import { apiTypes, types, data } from '../fixtures'

const fetchEntity = createFetchEntity(apiTypes)
const actions = actionsCreator(apiTypes)

const query = { id: 'user-1' }
const requestId = deriveRequestId('fetch', { query })

const state = {
  cache: {
    promises: {
      [types.USER]: {
        [requestId]: {
          outstanding: true,
        },
      },
    },
  },
}

const getPromise = (type, method, payload) => (
  getPromiseState(apiTypes, state, type, method, payload)
)

describe('Saga - fetchEntity', () => {
  describe('Cached', () => {
    it('should call `fetchEntity` the entity is not already cached')
    it('should dispatch a `cacheHit` action if the entity is already in the cache')
  })

  let generator

  beforeEach(() => {
    generator = fetchEntity(types.USER, query, getPromise)
  })

  it('should dispatch a `request` action', () => {
    expect(generator.next().value)
      .to.deep.equal(put(actions.request(types.USER, requestId)) )
  })

  it('should call the `fetch` function of the entity type passing in the query object', () => {
    generator.next()

    expect(generator.next().value).to.deep.equal(
      call(typeUtils.getFetch(apiTypes, types.USER), query)
    )
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()
    generator.next()

    const { result, entities } = normalize(data.user, apiTypes.USER.schema)

    expect(generator.next({ response: { result, entities } }).value).to.deep.equal(
      put(actions.success(types.USER, requestId, result, entities))
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    generator.next()
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value)
      .to.deep.equal( put(actions.failure(types.USER, requestId, error)) )
  })
})
