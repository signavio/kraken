import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import sinon from 'sinon'

import createConnect from '../../../src/components'
import { actionTypes } from '../../../src/actions'

import expect from '../../expect'

import { types, apiTypes, data } from '../fixtures'

const connect = createConnect(apiTypes)

const renderSpy = sinon.spy()

const MyComp = props => {
  renderSpy(props)
  return <div />
}

const reducerSpy = sinon.spy((state = {}) => state)
const testStore = createStore(reducerSpy, {
  kraken: {
    requests: {
      [types.USER]: {},
    },
    entities: {
      users: {},
    },
  },
})

const TestComponent = connect(({ offset = 0 }) => ({
  fetchUser: {
    type: types.USER,
    requestParams: {
      offset,
      pageSize: 25,
    },
  },
}))(MyComp)

const TestContainer = props => (
  <Provider store={testStore}>
    <TestComponent {...props} />
  </Provider>
)

describe('connectWithQuery', () => {
  beforeEach(() => {
    renderSpy.resetHistory()
    reducerSpy.resetHistory()
  })

  it('should dispatch the FETCH_DISPATCH action on mount', () => {
    mount(<TestContainer id={data.user.id} />)

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(testStore.getState(), {
      type: actionTypes.FETCH_DISPATCH,
      payload: {
        entityType: types.USER,
        requestParams: {
          offset: 0,
          pageSize: 25,
        },
      },
    })
  })

  it('should dispatch the FETCH_DISPATCH action when the promise props update', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)
    reducerSpy.resetHistory()

    expect(reducerSpy).to.have.not.been.called
    wrapper.setProps({ offset: 25 })

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(testStore.getState(), {
      type: actionTypes.FETCH_DISPATCH,
      payload: {
        entityType: types.USER,
        requestParams: {
          offset: 25,
          pageSize: 25,
        },
      },
    })
  })

  it('should not dispatch FETCH_DISPATCH action on update when promise props did not change', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)

    reducerSpy.resetHistory()
    expect(reducerSpy).to.have.not.been.called
    wrapper.setProps({ bla: 'blups' })

    expect(reducerSpy).to.have.not.been.called
    wrapper.update() // calls forceUpdate

    expect(reducerSpy).to.have.not.been.called
  })
})
