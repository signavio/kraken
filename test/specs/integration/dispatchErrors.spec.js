import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import sinon from 'sinon'
import React from 'react'
import { mount } from 'enzyme'
import fetchMock from 'fetch-mock'
import expect from '../../expect'

import apiCreator from '../../../src'
import { apiTypes, types, data } from '../fixtures'
import createLogActions from './createLogActions'

const { reducer, saga, connect } = apiCreator(apiTypes)

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

function url(path) {
  return matchingUrl => matchingUrl.indexOf(path) > -1
}

describe('Integration - dispatch errors', () => {
  let createApp
  let store
  let actions

  after(fetchMock.restore)

  beforeEach(() => {
    createApp = options => {
      const ConnectedApp = connect(() => ({
        fetchComment: {
          type: types.COMMENT,
          ...options,
        },
      }))(App)

      actions = []
      store = configureStore({}, action => actions.push(action))

      return mount(
        <Provider store={store}>
          <ConnectedApp />
        </Provider>
      ).find(App)
    }
  })

  it('should dispatch an error if the server responds with a 401', done => {
    fetchMock.get(url('/comments/123'), {
      body: { message: 'Unauthorized' },
      status: 401,
      sendAsJson: true,
    })

    const App = createApp({ id: '123' })

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
      expect(failure).to.deep.equal({
        type: 'KRAKEN_FETCH_FAILURE',
        payload: {
          entityType: 'COMMENT',
          requestId: 'fetch_["id","123"]',
          error: 'Unauthorized',
          status: 401,
        },
      })

      done()
    }, 20)
  })
})
