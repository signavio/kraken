import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import fetchMock from 'fetch-mock'
import React from 'react'
import { mount } from 'enzyme'
import expect from '../../expect'

import apiCreator from '../../../src'
import { apiTypes, types, data } from '../fixtures'
import pathFilter from './pathFilter'

const { reducer, saga, connect } = apiCreator(apiTypes)

const rootReducer = combineReducers({
  kraken: reducer,
})

function configureStore(initialState) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = compose(applyMiddleware(sagaMiddleware))(createStore)

  const store = finalCreateStore(rootReducer, initialState)
  sagaMiddleware.run(saga, store.getState)
  return store
}

describe('concurrent fetches', () => {
  let store
  const userPath = pathFilter(`/users/${data.user.id}`)

  const UserPure = ({ fetchUser }) => {
    return <div>{fetchUser.value && fetchUser.value.firstName}</div>
  }

  const User = connect(({ id }) => ({
    fetchUser: {
      type: types.USER,
      id,
    },
  }))(UserPure)

  const App = () => (
    <Provider store={store}>
      <div>
        <User id={data.user.id} />
        <User id={data.user.id} />
      </div>
    </Provider>
  )

  let app

  beforeEach(done => {
    store = configureStore()
    fetchMock.get(userPath, data.user)
    app = mount(<App />)
    setTimeout(() => {
      done()
    }, 30)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should call the fetch function only once', () => {
    expect(fetchMock.calls(userPath, 'GET')).to.have.length(1)
  })

  it('should render the firstName in both components', () => {
    expect(
      app
        .find(UserPure)
        .first()
        .find('div')
        .text()
    ).to.equal(data.user.firstName)
    expect(
      app
        .find(UserPure)
        .last()
        .find('div')
        .text()
    ).to.equal(data.user.firstName)
  })

  it('should use caches after the first fetch and not call fetch again', done => {
    expect(fetchMock.calls(userPath, 'GET')).to.have.length(1)
    app = mount(<App />)
    setTimeout(() => {
      expect(fetchMock.calls(userPath, 'GET')).to.have.length(1)
      done()
    }, 10)
  })
})
