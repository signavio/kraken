import React from 'react'
import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import { stub } from 'sinon'
import { mount } from 'enzyme'
import { expect } from 'chai'

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

describe('Integration - remove', () => {
  let remove
  let createApp

  beforeEach(() => {
    remove = stub().returns({})

    const types = {
      [entityType]: {
        collection: 'test',
        remove,
      },
    }

    const { reducer, saga, connect } = apiCreator(types)

    const rootReducer = combineReducers({
      kraken: reducer,
    })

    createApp = query => {
      const ConnectedApp = connect(() => ({
        removeSomething: {
          type: entityType,
          method: 'remove',
          query,
        },
      }))(App)

      return mount(
        <Provider store={configureStore(rootReducer, saga)}>
          <ConnectedApp />
        </Provider>
      ).find(App)
    }
  })

  it('should call the remove action', done => {
    const component = createApp()

    expect(component).to.have.prop('removeSomething')

    expect(remove).to.not.have.been.called

    setTimeout(() => {
      component.props().removeSomething()

      expect(remove).to.have.been.calledOnce

      done()
    })
  })

  it('should pass query params to the remove action', () => {
    const query = { foo: 'bar' }

    const component = createApp(query)

    expect(remove).to.not.have.been.called

    component.props().removeSomething()

    expect(remove).to.have.been.calledOnce
    expect(remove).to.have.been.calledWith(query)
  })

  it('should pass the body to the remove action', () => {
    const body = { id: 'foo' }

    const component = createApp()

    expect(remove).to.not.have.been.called

    component.props().removeSomething(body)

    expect(remove).to.have.been.calledOnce
    expect(remove).to.have.been.calledWith({}, body)
  })
})
