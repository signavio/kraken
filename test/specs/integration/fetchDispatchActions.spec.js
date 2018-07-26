import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import React from 'react'
import { mount } from 'enzyme'
import fetchMock from 'fetch-mock'
import { startsWith } from 'lodash/fp'
import expect from '../../expect'

import apiCreator from '../../../src'
import { apiTypes, types } from '../fixtures'
import createLogActions from './createLogActions'

const { reducer, saga, connect, actions: actionCreator } = apiCreator(apiTypes)

const rootReducer = combineReducers({
  kraken: reducer,
})

function configureStore(initialState, logCallback) {
  const sagaMiddleware = createSagaMiddleware()
  const logActionsSaga = createLogActions(logCallback)

  const finalCreateStore = compose(applyMiddleware(sagaMiddleware))(createStore)

  const store = finalCreateStore(rootReducer, initialState)
  sagaMiddleware.run(saga, store.getState)
  sagaMiddleware.run(logActionsSaga, store.getState)
  return store
}

const App = () => <div />

describe('Integration - dispatch fetch actions', () => {
  let createApp
  let store
  let actions

  let ConnectedApp

  beforeEach(() => {
    createApp = initialProps => {
      ConnectedApp = connect(({ type, query, requestParams }) => ({
        fetchComment: {
          type,
          query,
          requestParams,
        },
      }))(App)

      actions = []
      store = configureStore({}, action => actions.push(action))

      const Component = props => (
        <Provider store={store}>
          <ConnectedApp {...props} />
        </Provider>
      )

      return mount(<Component {...initialProps} />)
    }
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should partition results based on request params.', done => {
    const firstComment = { id: 'c1', body: 'My first comment' }
    const secondComment = { id: 'c2', body: 'My second comment' }

    fetchMock.get(startsWith('/comments'), {
      body: [{ id: 'c1', body: 'My first comment' }],
      status: 200,
    })

    const component = createApp({
      requestParams: {
        offset: 0,
        pageSize: 1,
      },
      type: types.COMMENTS,
    })

    setTimeout(() => {
      component.update()

      expect(component.find(App)).to.have.prop('fetchComment')
      expect(component.find(App).prop('fetchComment').value).to.eql([
        firstComment,
      ])

      fetchMock.restore()

      fetchMock.get(startsWith('/comments'), {
        body: [secondComment],
        status: 200,
      })

      component.setProps({
        requestParams: {
          offset: 1,
          pageSize: 1,
        },
      })

      setTimeout(() => {
        component.update()

        expect(component.find(App).prop('fetchComment').value).to.eql([
          secondComment,
        ])

        done()
      }, 20)
    }, 20)
  })

  it('should dispatch a success if the server responds with a 200', done => {
    fetchMock.get(startsWith('/comments/123'), {
      body: { id: '123', body: 'My awesome comment' },
      status: 200,
    })

    createApp({ type: types.COMMENT, query: { id: '123' } })

    setTimeout(() => {
      expect(actions).to.have.length(3)

      const success = actions[2]
      expect(success).to.deep.equal(
        actionCreator.succeedFetch({
          entityType: 'COMMENT',
          isCachedResponse: false,
          requestId: 'fetch_["id","123"]',
          value: '123',
          entities: {
            comments: {
              '123': {
                id: '123',
                body: 'My awesome comment',
              },
            },
          },
        })
      )

      done()
    }, 20)
  })

  it('should dispatch an error if the server responds with a 401', done => {
    fetchMock.get(startsWith('/comments/123'), {
      body: { message: 'Unauthorized' },
      status: 401,
    })

    createApp({ type: types.COMMENT, query: { id: '123' } })

    setTimeout(() => {
      const request = store.getState().kraken.requests.COMMENT[
        'fetch_["id","123"]'
      ]
      expect(request).to.not.be.undefined
      expect(request.rejected).to.be.true
      expect(request.reason).to.equal('Unauthorized')
      expect(request.status).to.equal(401)

      expect(actions).to.have.length(3)
      const failure = actions[2]
      expect(failure).to.deep.equal(
        actionCreator.failFetch({
          entityType: 'COMMENT',
          requestId: 'fetch_["id","123"]',
          error: 'Unauthorized',
          status: 401,
        })
      )

      done()
    }, 20)
  })
})
