/* eslint-disable no-unused-expressions */
/* eslint-disable react/no-multi-comp */

import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { mount } from 'enzyme'

import sinon from 'sinon'

import expect from '../../expect'

import createConnect from '../../../src/components/connect'

import types, { apiTypes } from '../../types'

const connect = createConnect(apiTypes)

import { FETCH_ENTITY } from '../../../src/actions'

const { Trace } = types

const renderSpy = sinon.spy()

const MyComp = (props) => {
  renderSpy(props)
  return <div />
}

const reducerSpy = sinon.spy((state = {}) => state)
const testStore = createStore(reducerSpy, {
  cache: {
    promises: { Subject: {}, Trace: {} },
    entities: { subjects: {}, traces: {} },
  },
})

const TestComponent = connect(({ traceId }) => ({
  fetchUser: {
    type: Trace,
    query: {
      id: traceId,
      nestedQuery: {
        something: 'string',
      },
    },
    requiredFields: ['activities'],
  },
}))(MyComp)

const TestContainer = (props) => (
  <Provider store={testStore}>
    <TestComponent {...props} />
  </Provider>
)

export default () => {
  beforeEach(() => {
    renderSpy.reset()
    reducerSpy.reset()
  })

  it('should dispatch the FETCH_ENTITY action on mount', () => {
    const traceId = 'trace1'

    mount(<TestContainer traceId={traceId} />)

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: FETCH_ENTITY,
        payload: {
          entity: Trace,
          query: {
            id: traceId,
            nestedQuery: {
              something: 'string',
            },
          },
        },
      }
    )
  })

  it('should dispatch the FETCH_ENTITY action when the promise props update', () => {
    const wrapper = mount(<TestContainer traceId={'trace1'} />)
    reducerSpy.reset()

    expect(reducerSpy).to.have.not.been.called
    wrapper.setProps({ traceId: 'trace2' })

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: FETCH_ENTITY,
        payload: {
          entity: Trace,
          query: {
            id: 'trace2',
            nestedQuery: {
              something: 'string',
            },
          },
        },
      }
    )
  })

  it('should not dispatch FETCH_ENTITY action on update when promise props did not change', () => {
    const wrapper = mount(<TestContainer traceId={'trace1'} />)
    console.log('1', wrapper.props())
    reducerSpy.reset()
    expect(reducerSpy).to.have.not.been.called
    wrapper.setProps({ bla: 'blups' })
    console.log('2', wrapper.props())
    expect(reducerSpy).to.have.not.been.called
    wrapper.update() // calls forceUpdate
    console.log('3', wrapper.props())
    expect(reducerSpy).to.have.not.been.called
  })
}
