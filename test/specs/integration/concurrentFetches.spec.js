import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import sinon from 'sinon'
import React from 'react'
import { mount } from 'enzyme'
import expect from '../../expect'

import apiCreator from '../../../src'
import { apiTypes, types, data } from '../fixtures'

const fetchStub = sinon.stub(apiTypes.USER, 'fetch').callsFake(
  () =>
    new Promise(resolve => {
      setTimeout(
        () =>
          resolve({
            response: {
              result: data.user.id,
              entities: {
                users: {
                  [data.user.id]: data.user,
                },
              },
            },
          }),
        1
      )
    })
)

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

  expect(fetchStub).to.have.not.been.called

  let app

  beforeEach(done => {
    store = configureStore()
    fetchStub.reset()
    app = mount(<App />)
    setTimeout(() => {
      done()
    }, 30)
  })

  it('should call the fetch function only once', () => {
    expect(fetchStub).to.have.been.calledOnce
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
    expect(fetchStub).to.have.been.calledOnce
    app = mount(<App />)
    setTimeout(() => {
      expect(fetchStub).to.have.been.calledOnce
      done()
    }, 10)
  })
})
