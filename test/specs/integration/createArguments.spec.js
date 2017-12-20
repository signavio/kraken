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

describe('Integration - create', () => {
  let create
  let createApp

  beforeEach(() => {
    create = stub().returns({})

    const types = {
      [entityType]: {
        collection: 'test',
        create,
      },
    }

    const { reducer, saga, connect } = apiCreator(types)

    const rootReducer = combineReducers({
      kraken: reducer,
    })

    createApp = query => {
      const ConnectedApp = connect(() => ({
        createSomething: {
          type: entityType,
          method: 'create',
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

  it('should call the create action', () => {
    const component = createApp()

    expect(component).to.have.prop('createSomething')

    expect(create).to.not.have.been.called

    component.props().createSomething()

    expect(create).to.have.been.calledOnce
  })

  it('should pass query params to the create action', () => {
    const query = { foo: 'bar' }

    const component = createApp(query)

    expect(create).to.not.have.been.called

    component.props().createSomething()

    expect(create).to.have.been.calledOnce
    expect(create).to.have.been.calledWith(query)
  })

  it('should pass the body to the create action', () => {
    const body = { id: 'foo' }

    const component = createApp()

    expect(create).to.not.have.been.called

    component.props().createSomething(body)

    expect(create).to.have.been.calledOnce
    expect(create).to.have.been.calledWith({}, body)
  })
})
