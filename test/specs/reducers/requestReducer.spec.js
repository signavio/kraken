import { normalize } from 'normalizr'

import expect from '../../expect'

import createActionCreators from '../../../src/actions'

import { deriveRequestIdFromAction } from '../../../src/utils'

import { createRequestsReducer } from '../../../src/reducers'

import { apiTypes, types, data } from '../fixtures'

const actions = createActionCreators(apiTypes)
const { result, entities } = normalize(data.user, apiTypes.USER.schema)

const id = 'my-id'
const query = { id }
const requestId = deriveRequestIdFromAction({ type: 'FETCH_DISPATCH', payload: { query: { id } } })
// const entityReducerForEntity = entityReducer(entity)

describe('requestReducer', () => {
  const requestsReducerForEntity = createRequestsReducer(apiTypes, types.USER)

  describe('FETCH_DISPATCH', () => {
    it('should set pending and outstanding flags', () => {
      const newState = requestsReducerForEntity(
        {},
        actions.dispatchFetch({ entityType: types.USER, query })
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('should reset value if refresh token updated', () => {
      const state = requestsReducerForEntity(
        {},
        actions.dispatchFetch({ entityType: types.USER, query, result })
      )

      expect(state).to.have.property(requestId)
      expect(state[requestId]).to.have.property('value')

      const nextState = requestsReducerForEntity(
        state,
        actions.dispatchFetch({ entityType: types.USER, query, refresh: 1 })
      )

      expect(nextState[requestId]).to.have.property('value', undefined)
      expect(nextState[requestId]).to.have.property('refresh', 1)
    })

    it('should keep the previous refresh token if another fetch of the same entity ' +
    'is dispatched without a refresh token', () => {
      const state = requestsReducerForEntity(
        {},
        actions.succeedFetch({
          requestId,
          entityType: types.USER,
          query,
          value: result,
        })
      )

      const nextState = requestsReducerForEntity(
        state,
        actions.dispatchFetch({ entityType: types.USER, query, refresh: 1 })
      )

      expect(nextState[requestId]).to.have.property('refresh', 1)

      requestsReducerForEntity(
        state,
        actions.dispatchFetch({ entityType: types.USER, query })
      )

      // still has the previous token
      expect(nextState[requestId]).to.have.property('refresh', 1)
    })

    it.skip('should set outstanding requests to not be outstanding anymore', () => {
      const newState = requestsReducerForEntity(
        {
          [requestId]: {
            outstanding: true,
          },
        },
        actions.dispatchFetch({ entityType: types.USER, requestId })
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })
  })

  describe('FETCH_SUCCESS', () => {
    it('should set the promise state to fulfilled when cached', () => {
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.succeedFetch({
          requestId,
          entityType: types.USER,
          query,
          value: result,
        })
      )

      expect(newState).to.have.property(requestId)
      // expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
    })

    it('should set the value', () => {
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.succeedFetch({
          requestId,
          entityType: types.USER,
          query,
          value: result,
        })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('value').to.equal(result)
    })

    it('should set the promise status to fulfilled when not cached', () => {
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.succeedFetch({
          entityType: types.USER,
          requestId,
          value: result,
          entities,
        })
      )
      expect(newState).to.have.property(requestId)

      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
    })

    it('should set the value.', () => {
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.succeedFetch({
          entityType: types.USER,
          requestId,
          value: result,
          entities,
        })
      )
      expect(newState).to.have.property(requestId)

      expect(newState[requestId]).to.have.property('value').to.equal(result)
    })
  })

  describe('FETCH_FAILURE', () => {
    it('should reject the promise', () => {
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.failFetch({ entityType: types.USER, requestId })
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', false)
      expect(newState[requestId]).to.have.property('rejected', true)
    })

    it('should add an error message', () => {
      const error = 'the error message'

      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.failFetch({
          entityType: types.USER,
          requestId,
          error,
        })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('reason', error)
    })
  })
})
