import React, { Component } from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { shallow, mount } from 'enzyme'

import sinon from 'sinon'

import expect from '../../expect'

import createConnect from '../../../src/components/connect'

import types, { apiTypes } from '../../types'

const connect = createConnect(apiTypes)

import { LOAD_ENTITY } from '../../../src/actions'

const { Trace } = types

const renderSpy = sinon.spy()

class MyComp extends Component {
  render() {
    renderSpy(this.props)
    return <div />
  }
}

// var MyFunctionalComp = (props) => <div />
// MyFunctionalComp = connect(props => ({
//     userFetch: { type: Trace, id: props.userId }
// }))(MyFunctionalComp)

const reducerSpy = sinon.spy((state = {}) => state)
const testStore = createStore(reducerSpy, {
  cache: {
    promises: { Trace: {} },
    entities: { trace: {} },
  },
})

export default () => {

  // let store

  beforeEach(() => {
    renderSpy.reset()
    reducerSpy.reset()
  })

  it('should dispatch the LOAD_ENTITY action on mount', () => {
    const traceId = 'trace1'

    const TestComponent = connect(props => ({
      userFetch: { type: Trace, id: props.traceId },
    }))(MyComp)

    const wrapper = mount(
        <Provider store={testStore}>
            <TestComponent traceId={traceId} />
        </Provider>
    )

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: LOAD_ENTITY,
        payload: {
          entity: Trace,
          query: {
            id: traceId,
          },
        },
      }
    )
  })

  it('should not rerender if the used state did not change', () => {
    const traceId = 'trace1'

    const TestComponent = connect(props => ({
      userFetch: { type: Trace, id: props.traceId },
    }))(MyComp)

    const wrapper = mount(
        <Provider store={testStore}>
            <TestComponent traceId={traceId} />
        </Provider>
    )
    expect(renderSpy).to.have.been.calledOnce

    testStore.dispatch({ type: 'DUMMY_ACTION' })
    expect(renderSpy).to.have.been.calledOnce
  })

  describe('#getWrappedInstance', () => {

    class CompWithRefs extends Component {
      render() {
        return (
          <div ref="myRef">
            Text
          </div>
        )
      }
    }
    CompWithRefs = connect(props => ({
      userFetch: { type: Trace, id: props.userId }
    }), { withRef: true })(CompWithRefs)

    it('should return the wrapped instance', () => {
      const wrapper = mount(
        <Provider store={testStore}>
            <CompWithRefs userId="user1" />
        </Provider>
      )
      // first getWrappedInstance() is from reduxConnect
      // second getWrappedInstance() is from own connect
      expect(
        wrapper.find(CompWithRefs).get(0).getWrappedInstance().getWrappedInstance().refs.myRef
      ).to.exist
    })
  })
}
