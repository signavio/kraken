import { put, call } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import { createFetchSaga } from '../../../src/sagas/watchFetchDispatch'

import actionsCreator, { actionTypes } from '../../../src/actions'
import { deriveRequestIdFromAction } from '../../../src/utils'
import { getFetch } from '../../../src/types'

import expect from '../../expect'

import { apiTypes, types, data } from '../fixtures'

const fetchSaga = createFetchSaga(apiTypes)
const actions = actionsCreator(apiTypes)

const query = { id: 'user-1' }

const fetchAction = {
  type: actionTypes.FETCH_DISPATCH,
  payload: { entityType: types.USER, query },
}
const requestId = deriveRequestIdFromAction(fetchAction)

const state = {
  kraken: {
    requests: {
      [types.USER]: {
        [requestId]: {
          outstanding: true,
        },
      },
    },
    entities: {
      [types.USER]: {},
    },
  },
}

const getState = () => state

describe('Saga - fetchSaga', () => {
  describe('Cached', () => {
    it('should call `fetchSaga` the entity is not already cached')
    it(
      'should dispatch a `cacheHit` action if the entity is already in the cache'
    )
  })

  let generator

  beforeEach(() => {
    generator = fetchSaga(fetchAction, getState)

    // delay
    generator.next()
    // start request
    generator.next()
  })

  it('should call the `fetch` function of the entity type passing in the query object', () => {
    expect(generator.next().value).to.deep.equal(
      call(getFetch(apiTypes, types.USER), query, undefined)
    )
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()

    const { result, entities } = normalize(data.user, apiTypes.USER.schema)

    expect(
      generator.next({ response: { result, entities } }).value
    ).to.deep.equal(
      put(
        actions.succeedFetch({
          entityType: types.USER,
          requestId,
          value: result,
          entities,
          isCachedResponse: false,
        })
      )
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value).to.deep.equal(
      put(actions.failFetch({ entityType: types.USER, requestId, error }))
    )
  })

  it('should dispatch success action if request is 204 (empty response)', () => {
    generator.next()

    expect(generator.next({ response: undefined }).value).to.deep.equal(
      put(
        actions.succeedFetch({
          entityType: types.USER,
          requestId,
          value: undefined,
          entities: undefined,
          isCachedResponse: false,
        })
      )
    )
  })
})
