import { expect } from 'chai'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { stub } from 'sinon'

import apiCreator from '../../../src'

const entityType = 'TEST_TYPE'

function configureStore(rootReducer, saga) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = compose(applyMiddleware(sagaMiddleware))(createStore)

  const store = finalCreateStore(rootReducer)
  sagaMiddleware.run(saga, store.getState)
  return store
}

const App = () => <div />

describe('Integration - fetch', () => {
  let fetch
  let createApp

  beforeEach(() => {
    fetch = stub().returns({})

    const types = {
      [entityType]: {
        collection: 'test',
        fetch: () => fetch,
      },
    }

    const { reducer, saga, connect } = apiCreator(types)

    const rootReducer = combineReducers({
      kraken: reducer,
    })

    createApp = (options) => {
      const ConnectedApp = connect(() => ({
        fetchSomething: {
          type: entityType,
          method: 'fetch',
          ...options,
        },
      }))(App)

      return mount(
        <Provider store={configureStore(rootReducer, saga)}>
          <ConnectedApp />
        </Provider>
      ).find(App)
    }
  })

  it('should call the fetch action', (done) => {
    createApp()

    setTimeout(() => {
      expect(fetch).to.have.been.calledOnce

      done()
    })
  })

  it('should not call the fetch function if the `lazy` prop is set.', (done) => {
    const component = createApp({ lazy: true })

    setTimeout(() => {
      expect(fetch).to.not.have.been.called

      component.props().fetchSomething()

      setTimeout(() => {
        expect(fetch).to.have.been.calledOnce

        done()
      }, 2)
    })
  })

  it('should pass query params to the fetch action', (done) => {
    const query = { foo: 'bar' }

    createApp({ query })

    setTimeout(() => {
      expect(fetch).to.have.been.calledOnce
      expect(fetch).to.have.been.calledWith(query)

      done()
    }, 2)
  })

  it('should pass the body to the fetch action', (done) => {
    const body = { id: 'foo' }

    const component = createApp({ lazy: true })

    expect(fetch).to.not.have.been.called

    component.props().fetchSomething(body)

    setTimeout(() => {
      expect(fetch).to.have.been.calledOnce
      expect(fetch).to.have.been.calledWith({}, body)

      done()
    }, 2)
  })
})
