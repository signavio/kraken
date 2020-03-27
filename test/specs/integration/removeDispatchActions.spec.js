import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import React from 'react'
import { mount } from 'enzyme'
import fetchMock from 'fetch-mock'
import expect from '../../expect'

import apiCreator from '../../../src'
import { apiTypes, types, data } from '../fixtures'
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

describe('Integration - dispatch remove actions', () => {
  let createApp
  let store
  let actions

  beforeEach(() => {
    createApp = (options) => {
      const ConnectedApp = connect(() => ({
        removePost: {
          type: types.POST,
          method: 'remove',
          ...options,
        },
      }))(App)

      actions = []
      store = configureStore({}, (action) => actions.push(action))

      return mount(
        <Provider store={store}>
          <ConnectedApp />
        </Provider>
      ).find(App)
    }
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should dispatch a remove success action when the server returns a 204', (done) => {
    fetchMock.delete(`/posts/${data.post.id}`, {
      status: 204,
    })

    const app = createApp({ id: data.post.id })
    app.props().removePost()

    setTimeout(() => {
      expect(actions).to.have.length(2)

      expect(actions[0]).to.deep.equal(
        actionCreator.dispatchRemove({
          entityType: 'POST',
          query: {
            id: data.post.id,
          },
          body: undefined,
          requestParams: {},
        })
      )
      expect(actions[1]).to.deep.equal(
        actionCreator.succeedRemove({
          entityType: 'POST',
          requestId: `remove_["id","${data.post.id}"]`,
        })
      )

      done()
    }, 20)
  })

  it('should dispatch a remove failure action when the server returns a 401', (done) => {
    fetchMock.delete(`/posts/${data.post.id}`, {
      body: { message: 'Unauthorized' },
      status: 401,
    })

    const app = createApp({ id: data.post.id })
    app.props().removePost()

    setTimeout(() => {
      expect(actions).to.have.length(2)

      expect(actions[0]).to.deep.equal(
        actionCreator.dispatchRemove({
          entityType: 'POST',
          query: {
            id: data.post.id,
          },
          body: undefined,
          requestParams: {},
        })
      )
      expect(actions[1]).to.deep.equal(
        actionCreator.failRemove({
          entityType: 'POST',
          requestId: `remove_["id","${data.post.id}"]`,
          error: 'Unauthorized',
          status: 401,
        })
      )

      done()
    }, 20)
  })
})
