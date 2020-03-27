import { normalize } from 'normalizr'

import expect from '../../expect'

import createActionCreators, { actionTypes } from '../../../src/actions'

import { deriveRequestIdFromAction } from '../../../src/utils'

import { createRequestsReducer } from '../../../src/reducers'

import { apiTypes, types, data } from '../fixtures'

const actions = createActionCreators(apiTypes)
const { result, entities } = normalize(data.user, apiTypes.USER.schema)

const id = 'my-id'
const query = { id }
const requestId = deriveRequestIdFromAction({
  type: actionTypes.FETCH_DISPATCH,
  payload: { query: { id } },
})
// const entityReducerForEntity = entityReducer(entity)

describe('requestReducer', () => {
  const requestsReducerForEntity = createRequestsReducer(apiTypes, types.USER)

  it('should not fail on actions that are not part of kraken', () => {
    const newState = requestsReducerForEntity(
      {},
      { type: 'SOME_ACTION_NOT_FROM_KRAKEN' }
    )

    expect(newState).to.deep.equal({})
  })

  describe('FETCH_DISPATCH', () => {
    it('should include request parameters in the request.', () => {
      const requestParams = {
        offset: 0,
        pageSize: 25,
      }

      const newState = requestsReducerForEntity(
        {},
        actions.dispatchFetch({ entityType: types.USER, requestParams })
      )

      const newRequestId = deriveRequestIdFromAction({
        type: actionTypes.FETCH_DISPATCH,
        payload: {
          requestParams,
        },
      })

      expect(newState).to.have.property(newRequestId)
      expect(newState[newRequestId]).to.have.property(
        'requestParams',
        requestParams
      )
      expect(newState[newRequestId]).to.have.property('reason', null)
      expect(newState[newRequestId]).to.have.property('status', null)
    })

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

    it(
      'should keep the previous refresh token if another fetch of the same entity ' +
        'is dispatched without a refresh token',
      () => {
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
      }
    )

    it('should set outstanding requests to not be outstanding anymore', () => {
      let newState = requestsReducerForEntity(
        {
          [requestId]: {
            outstanding: true,
          },
        },
        actions.dispatchFetch({ entityType: types.USER, requestId })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)

      newState = requestsReducerForEntity(
        newState,
        actions.startRequest({
          entityType: types.USER,
          requestId,
        })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })
  })

  describe('CREATE_DISPATCH', () => {
    it('should include request body in a create user request.', () => {
      const body = {
        emailAddress: 'new-user@signavio.com',
      }

      const newState = requestsReducerForEntity(
        {},
        actions.dispatchCreate({
          entityType: types.USER,
          body,
        })
      )

      const newRequestId = deriveRequestIdFromAction({
        type: actionTypes.CREATE_DISPATCH,
        payload: {
          body,
        },
      })

      expect(newState).to.have.property(newRequestId)
      expect(newState[newRequestId]).to.have.property('body', body)
    })

    it('should have undefined body if the request does not include a body.', () => {
      const body = undefined

      const newState = requestsReducerForEntity(
        {},
        actions.dispatchCreate({
          entityType: types.USER,
          body,
        })
      )

      const newRequestId = deriveRequestIdFromAction({
        type: actionTypes.CREATE_DISPATCH,
        payload: {
          body,
        },
      })

      expect(newState).to.have.property(newRequestId)
      expect(newState[newRequestId]).to.have.property('body', undefined)
    })
  })

  describe('CREATE_SUCCESS', () => {
    it('should include body in a succeeded create user request from initial create dispatch request.', () => {
      const body = {
        emailAddress: 'new-user@signavio.com',
      }

      const initialState = requestsReducerForEntity(
        {},
        actions.dispatchCreate({
          entityType: types.USER,
          body,
        })
      )

      const requestId = deriveRequestIdFromAction({
        type: actionTypes.CREATE_DISPATCH,
        payload: {
          body,
        },
      })

      const newState = requestsReducerForEntity(
        initialState,
        actions.succeedCreate({
          requestId,
          entityType: types.USER,
        })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('body', body)
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
          status: 200,
          value: result,
        })
      )

      expect(newState).to.have.property(requestId)
      // expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('reason', null)
      expect(newState[requestId]).to.have.property('status', 200)
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

    it('should set the responseHeaders', () => {
      const responseHeaders = new Headers({ 'Content-Type': 'text/xml' })
      const newState = requestsReducerForEntity(
        { [requestId]: {} },
        actions.succeedFetch({
          requestId,
          responseHeaders,
          entityType: types.USER,
          query,
          value: result,
        })
      )

      expect(newState[requestId]).to.have.property(
        'responseHeaders',
        responseHeaders
      )
      expect(newState[requestId].responseHeaders.get('Content-Type')).to.equal(
        'text/xml'
      )
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
          status: 502,
        })
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('reason', error)
      expect(newState[requestId]).to.have.property('status', 502)
    })
  })
})
