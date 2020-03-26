import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import React from 'react'
import { mount } from 'enzyme'
import fetchMock from 'fetch-mock'
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

describe('Integration - dispatch create actions', () => {
  let createApp
  let store
  let actions

  beforeEach(() => {
    createApp = (options) => {
      const ConnectedApp = connect(() => ({
        createPost: {
          type: types.POST,
          method: 'create',
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

  it('should dispatch a create success action when the server returns a 200', (done) => {
    fetchMock.post('/posts/', {
      id: 'post-2',
      title: 'Very new post',
      description: 'All the infos here',
    })

    const app = createApp()
    app.props().createPost({
      title: 'Very new post',
      description: 'All the infos here',
    })

    setTimeout(() => {
      expect(actions).to.have.length(2)

      const elementId = actions[0].payload.elementId

      expect(actions[0]).to.deep.equal(
        actionCreator.dispatchCreate({
          entityType: 'POST',
          elementId,
          query: {},
          body: {
            title: 'Very new post',
            description: 'All the infos here',
          },
          requestParams: {},
        })
      )
      expect(actions[1]).to.deep.equal(
        actionCreator.succeedCreate({
          entityType: 'POST',
          requestId: `create__${elementId}`,
          value: 'post-2',
          entities: {
            posts: {
              'post-2': {
                description: 'All the infos here',
                id: 'post-2',
                title: 'Very new post',
              },
            },
          },
        })
      )

      done()
    }, 20)
  })

  it('should dispatch a create success action when the server returns a 204 and no body', (done) => {
    fetchMock.post('/posts/', {
      status: 204,
    })

    const app = createApp()
    app.props().createPost({
      title: 'Very new post',
      description: 'All the infos here',
    })

    setTimeout(() => {
      expect(actions).to.have.length(2)

      const elementId = actions[0].payload.elementId

      expect(actions[0]).to.deep.equal(
        actionCreator.dispatchCreate({
          entityType: 'POST',
          elementId,
          query: {},
          body: {
            title: 'Very new post',
            description: 'All the infos here',
          },
          requestParams: {},
        })
      )
      expect(actions[1]).to.deep.equal(
        actionCreator.succeedCreate({
          entityType: 'POST',
          requestId: `create__${elementId}`,
          value: undefined,
          entities: {},
        })
      )

      done()
    }, 20)
  })

  it('should dispatch a create failure action when the server returns a 401', (done) => {
    fetchMock.post('/posts/', {
      body: { message: 'Unauthorized' },
      status: 401,
    })

    const app = createApp()
    app.props().createPost({
      title: 'Very new post',
      description: 'All the infos here',
    })

    setTimeout(() => {
      expect(actions).to.have.length(2)

      const elementId = actions[0].payload.elementId

      expect(actions[0]).to.deep.equal(
        actionCreator.dispatchCreate({
          entityType: 'POST',
          elementId,
          query: {},
          body: {
            title: 'Very new post',
            description: 'All the infos here',
          },
          requestParams: {},
        })
      )
      expect(actions[1]).to.deep.equal(
        actionCreator.failCreate({
          entityType: 'POST',
          requestId: `create__${elementId}`,
          error: 'Unauthorized',
          status: 401,
        })
      )

      done()
    }, 20)
  })
})
