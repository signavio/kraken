import { compose, combineReducers, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'

import sinon from 'sinon'
import React from 'react'
import { mount } from 'enzyme'
import expect from '../../expect'

import apiCreator from '../../../src'
import types, { apiTypes } from '../../types'


const fetchStub = sinon.stub(apiTypes.Case, 'fetch', (url, options) => {
  return new Promise(function(resolve, reject) { 
    setTimeout(function() {
      resolve({ 
        response: {
          result: 1,
          entities: {
            case: {
              1: { id: 1, name: 'case1' }
            }
          }
        }
      });
    }, 1)
  })
})

const {
  reducer,
  saga,
  connect,
  actions,
} = apiCreator(apiTypes)

const rootReducer = combineReducers({
  cache: reducer,
})

function configureStore(initialState) {
  const sagaMiddleware = createSagaMiddleware()

  const finalCreateStore = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore)

  const store = finalCreateStore(rootReducer, initialState)
  sagaMiddleware.run(saga, store.getState)
  return store
}

describe('concurrent fetches', () => {

  let store

  const CaseCompPure = ({ fetchCase }) => {
    return (<div>
        { fetchCase.value && fetchCase.value.name }
      </div>
    )
  }

  const CaseComp = connect(({ id }) => ({
    fetchCase: {
      type: types.Case,
      id,
    }
  }))(CaseCompPure)

  const App = () => (
    <Provider store={store}>
      <div>
        <CaseComp id={1} />
        <CaseComp id={1} />
      </div>
    </Provider>
  )

  expect(fetchStub).to.have.not.been.called

  let app

  beforeEach((done) => {
    store = configureStore()
    fetchStub.reset()
    app = mount(<App />)
    setTimeout(() => { done() }, 30)
  })

  it('should call the fetch function only once', () => {
    expect(fetchStub).to.have.been.calledOnce
  })

  it('should render the case name in both components', () => {
    expect(app.find(CaseCompPure).first().find('div').text()).to.equal('case1')
    expect(app.find(CaseCompPure).last().find('div').text()).to.equal('case1')
  })

  it('should use caches after the first fetch and not call fetch again', (done) => {
    expect(fetchStub).to.have.been.calledOnce
    app = mount(<App />)
    setTimeout(() => {
      expect(fetchStub).to.have.been.calledOnce
      done() 
    }, 10)
  })
  
})
