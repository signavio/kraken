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

describe('Integration - dispatch update actions', () => {
  let createApp
  let store
  let actions

  beforeEach(() => {
    createApp = options => {
      const ConnectedApp = connect(() => ({
        updatePost: {
          type: types.POST,
          method: 'update',
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

  afterEach(() => {
    fetchMock.restore()
  })

  it('should dispatch an update success action when the server returns a 200', done => {
    fetchMock.put(`/posts/${data.post.id}`, {
      id: data.post.id,
      title: 'Updated post',
      description: 'All the infos here',
    })

    const app = createApp({ id: data.post.id })
    app.props().updatePost({
      id: data.post.id,
      title: 'Updated post',
      description: 'All the infos here',
    })

    setTimeout(() => {
      expect(actions).to.have.length(2)

      expect(actions[0]).to.deep.equal({
        type: 'KRAKEN_UPDATE_DISPATCH',
        payload: {
          entityType: 'POST',
          query: {
            id: data.post.id,
          },
          body: {
            id: data.post.id,
            title: 'Updated post',
            description: 'All the infos here',
          },
        },
      })
      expect(actions[1]).to.deep.equal({
        type: 'KRAKEN_UPDATE_SUCCESS',
        payload: {
          entityType: 'POST',
          requestId: `update_["id","${data.post.id}"]`,
          value: data.post.id,
          entities: {
            posts: {
              [data.post.id]: {
                id: data.post.id,
                title: 'Updated post',
                description: 'All the infos here',
              },
            },
          },
        },
      })

      done()
    }, 20)
  })

  it('should dispatch a create failure action when the server returns a 401', done => {
    fetchMock.put(`/posts/${data.post.id}`, {
      body: { message: 'Unauthorized' },
      status: 401,
    })

    const app = createApp({ id: data.post.id })
    app.props().updatePost({
      id: data.post.id,
      title: 'Updated post',
      description: 'All the infos here',
    })

    setTimeout(() => {
      expect(actions).to.have.length(2)

      expect(actions[0]).to.deep.equal({
        type: 'KRAKEN_UPDATE_DISPATCH',
        payload: {
          entityType: 'POST',
          query: {
            id: data.post.id,
          },
          body: {
            id: data.post.id,
            title: 'Updated post',
            description: 'All the infos here',
          },
        },
      })
      expect(actions[1]).to.deep.equal({
        type: 'KRAKEN_UPDATE_FAILURE',
        payload: {
          entityType: 'POST',
          requestId: `update_["id","${data.post.id}"]`,
          error: 'Unauthorized',
          status: 401,
        },
      })

      done()
    }, 20)
  })
})
