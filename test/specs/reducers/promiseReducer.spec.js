import expect from '../../expect'

import createActionCreators from '../../../src/actions'

import { deriveRequestId } from '../../../src/utils'

import { createPromisesReducer } from '../../../src/reducers'

import * as data from '../../data'

import { apiTypes, default as types } from '../../types'

const actions = createActionCreators(apiTypes)
const sampleData = data.Case.response

const id = 'my-id'
const query = { id }
const requestId = deriveRequestId('fetch', { query: { id } })
// const entityReducerForEntity = entityReducer(entity)

describe('promiseReducer', () => {
  const promiseReducerForEntity = createPromisesReducer(apiTypes, types.Case)

  describe('FETCH_ENTITY', () => {
    it('should set pending and outstanding flags', () => {
      const newState = promiseReducerForEntity(
        {},
        actions.fetchEntity(types.Case, query)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('should reset value if refresh token updated', () => {
      const state = promiseReducerForEntity(
        {},
        actions.cacheHit(types.Case, query, sampleData.result)
      )

      expect(state).to.have.property(requestId)
      expect(state[requestId]).to.have.property('value')

      const nextState = promiseReducerForEntity(
        state,
        actions.fetchEntity(types.Case, query, 1)
      )

      expect(nextState[requestId]).to.have.property('value', undefined)
      expect(nextState[requestId]).to.have.property('refresh', 1)
    })

    it('should keep the previous refresh token if another fetch of the same entity ' +
    'is dispatched without a refresh token', () => {
      const state = promiseReducerForEntity(
        {},
        actions.cacheHit(
          types.Case, query,
          sampleData.result
        )
      )

      const nextState = promiseReducerForEntity(
        state,
        actions.fetchEntity(types.Case, query, 1)
      )

      expect(nextState[requestId]).to.have.property('refresh', 1)

      promiseReducerForEntity(
        state,
        actions.fetchEntity(types.Case, query)
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

        actions.request(types.Case, requestId)
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
          types.Case, query,

          sampleData.result,
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
          types.Case, query,

          sampleData.result,
        )
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('value').to.equal(sampleData.result)
    })
  })

  describe('SUCCESS', () => {
    it('should set the promise status to fulfilled.', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },
        actions.success(
          types.Case, requestId,

          sampleData.result,
          sampleData.entities,
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
          types.Case, requestId,

          sampleData.result,
          sampleData.entities,
        )
      )
      expect(newState).to.have.property(requestId)

      expect(newState[requestId]).to.have.property('value').to.equal(sampleData.result)
    })
  })

  describe('FAILURE', () => {
    it('should reject the promise', () => {
      const newState = promiseReducerForEntity(
        { [requestId]: {} },

        actions.failure(types.Case, requestId)
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
          types.Case, requestId,

          error,
        )
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('reason', error)
    })
  })
})
