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

describe('Integration - update', () => {
  let update
  let createApp

  beforeEach(() => {
    update = stub().returns({})

    const types = {
      [entityType]: {
        collection: 'test',
        update: () => update,
      },
    }

    const { reducer, saga, connect } = apiCreator(types)

    const rootReducer = combineReducers({
      kraken: reducer,
    })

    createApp = (query) => {
      const ConnectedApp = connect(() => ({
        updateSomething: {
          type: entityType,
          method: 'update',
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

  it('should call the update action', () => {
    const component = createApp()

    expect(component).to.have.prop('updateSomething')

    expect(update).to.not.have.been.called

    component.props().updateSomething({ id: 'foo' })

    expect(update).to.have.been.calledOnce
  })

  it('should pass query params to the update action', () => {
    const query = { foo: 'bar' }

    const component = createApp(query)

    expect(update).to.not.have.been.called

    component.props().updateSomething({ id: 'foo' })

    expect(update).to.have.been.calledOnce
    expect(update).to.have.been.calledWith(query)
  })

  it('should pass the body to the update action', () => {
    const body = { id: 'foo' }

    const component = createApp()

    expect(update).to.not.have.been.called

    component.props().updateSomething(body)

    expect(update).to.have.been.calledOnce
    expect(update).to.have.been.calledWith({}, body)
  })
})
