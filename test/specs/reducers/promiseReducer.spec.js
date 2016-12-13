import { normalize } from 'normalizr'

import expect from '../../expect'

import createActionCreators from '../../../src/actions'

import { deriveRequestId } from '../../../src/utils'

import { createPromisesReducer } from '../../../src/reducers'

import { apiTypes, types, data } from '../fixtures'

const actions = createActionCreators(apiTypes)
const { result, entities } = normalize(data.user, apiTypes.USER.schema)

const id = 'my-id'
const query = { id }
const requestId = deriveRequestId('fetch', { query: { id } })
// const entityReducerForEntity = entityReducer(entity)

describe('promiseReducer', () => {
  const promiseReducerForEntity = createPromisesReducer(apiTypes, types.USER)

  describe('FETCH_ENTITY', () => {
    it('should set pending and outstanding flags', () => {
      const newState = promiseReducerForEntity(
        {},
        actions.fetchEntity(types.USER, query)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('should reset value if refresh token updated', () => {
      const state = promiseReducerForEntity(
        {},
        actions.cacheHit(types.USER, query, result)
      )

      expect(state).to.have.property(requestId)
      expect(state[requestId]).to.have.property('value')

      const nextState = promiseReducerForEntity(
        state,
        actions.fetchEntity(types.USER, query, 1)
      )

      expect(nextState[requestId]).to.have.property('value', undefined)
      expect(nextState[requestId]).to.have.property('refresh', 1)
    })

    it('should keep the previous refresh token if another fetch of the same entity ' +
    'is dispatched without a refresh token', () => {
      const state = promiseReducerForEntity(
        {},
        actions.cacheHit(
          types.USER, query,
          result
        )
      )

      const nextState = promiseReducerForEntity(
        state,
        actions.fetchEntity(types.USER, query, 1)
      )

      expect(nextState[requestId]).to.have.property('refresh', 1)

      promiseReducerForEntity(
        state,
        actions.fetchEntity(types.USER, query)
      )

      // still has the previous token
      expect(nextState[requestId]).to.have.property('refresh', 1)
    })
  })


  describe('REQUEST', () => {
    it('should set outstanding requests to not be outstanding anymore', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {
          outstanding: true,
        } },

        actions.request(types.USER, requestId)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })
  })

  describe('CACHE_HIT', () => {
    it('should set the promise state to fulfilled', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },
        actions.cacheHit(
          types.USER, query,

          result,
        )
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
    })

    it('should set the value', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },
        actions.cacheHit(
          types.USER, query,

          result,
        )
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('value').to.equal(result)
    })
  })

  describe('SUCCESS', () => {
    it('should set the promise status to fulfilled.', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },
        actions.success(
          types.USER, requestId,

          result,
          entities,
        )
      )
      expect(newState).to.have.property(requestId)

      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
    })

    it('should set the value.', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },
        actions.success(
          types.USER, requestId,

          result,
          entities,
        )
      )
      expect(newState).to.have.property(requestId)

      expect(newState[requestId]).to.have.property('value').to.equal(result)
    })
  })

  describe('FAILURE', () => {
    it('should reject the promise', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },

        actions.failure(types.USER, requestId)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', false)
      expect(newState[requestId]).to.have.property('rejected', true)
    })

    it('should add an error message', () => {
      const error = 'the error message'

      const newState = promiseReducerForEntity(
        { [requestId]: {} },

        actions.failure(
          types.USER, requestId,

          error,
        )
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('reason', error)
    })
  })
})
