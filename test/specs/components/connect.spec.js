import React, { Component } from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import sinon from 'sinon'

import createConnect from '../../../src/components'
import createActionCreators, { actionTypes } from '../../../src/actions'
import { deriveRequestIdFromAction } from '../../../src/utils'

import expect from '../../expect'

import { types, apiTypes, data } from '../fixtures'

const connect = createConnect(apiTypes)

const { dispatchFetch, dispatchCreate } = createActionCreators(apiTypes)

const renderSpy = sinon.spy()

const MyComp = (props) => {
  renderSpy(props)
  return <div />
}

const fetchUserJaneAction = dispatchFetch({ entityType: types.USER, id: 'user-jane' })

const reducerSpy = sinon.spy((state = {}) => state)
const testStore = createStore(reducerSpy, {
  genericApi: {
    requests: {
      [types.USER]: {
        [deriveRequestIdFromAction(fetchUserJaneAction)]: {
          value: 'user-jane',
          fulfilled: true,
          refresh: 2,
        }
      },
    },
    entities: {
      [apiTypes.USER.collection]: {
        'user-jane': {
          id: 'user-jane',
          firstName: 'Jane',
          lastName: 'Doe',
        }
      },
    },
  },
})

const TestComponent = connect(({ id, refresh }) => ({
  fetchUser: {
    type: types.USER,
    id,
    refresh,
  },
}))(MyComp)

const TestContainer = (props) => (
  <Provider store={ testStore }>
    <TestComponent {...props} />
  </Provider>
)

describe('connect', () => {
  beforeEach(() => {
    renderSpy.reset()
    reducerSpy.reset()
  })

  it('should dispatch the FETCH_DISPATCH action on mount', () => {
    mount(<TestContainer id={ data.user.id } />)

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: actionTypes.FETCH_DISPATCH,
        payload: {
          entityType: types.USER,
          query: {
            id: data.user.id,
          },
        },
      }
    )
  })

  it('should dispatch the FETCH_DISPATCH action when the promise props updates', () => {
    const wrapper = mount(<TestContainer id={ data.user.id } />)
    reducerSpy.reset()

    expect(reducerSpy).to.have.not.been.called
    wrapper.setProps({ id: 'user-2' })

    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: actionTypes.FETCH_DISPATCH,
        payload: {
          entityType: types.USER,
          query: {
            id: 'user-2',
          },
        },
      }
    )
  })

  it('should dispatch FETCH_DISPATCH action if the refresh token is not matching', () => {
    const wrapper = mount(<TestContainer id="user-jane" />)
    expect(reducerSpy).to.have.not.been.called // it's already cached

    wrapper.setProps({ refresh: 3 })
    expect(reducerSpy).to.have.been.calledOnce
  })

  it('should dispatch FETCH_DISPATCH action if `fetchOnMount` is true', () => {
    mount(<TestContainer id="user-jane" fetchOnMount />)

    expect(reducerSpy).to.have.been.calledOnce
  })

  it('should not dispatch FETCH_DISPATCH action if `fetchOnMount` is false', () => {
    mount(<TestContainer id="user-jane" fetchOnMount={false} />)

    expect(reducerSpy).to.have.not.been.called
  })

  it('should not dispatch FETCH_DISPATCH action if `fetchOnMount` is true and lifecycle event is not componentWillMount', () => {
    const wrapper = mount(<TestContainer id="user-jane" />)
    expect(reducerSpy).to.have.not.been.called

    wrapper.setProps({ fetchOnMount: true })
    expect(reducerSpy).to.have.not.been.called
  })

  it('should not dispatch FETCH_DISPATCH action on update when promise props did not change', () => {
    const wrapper = mount(<TestContainer id={ data.user.id } />)
    reducerSpy.reset()
    expect(reducerSpy).to.have.not.been.called

    wrapper.setProps({ bla: 'blups' })
    expect(reducerSpy).to.have.not.been.called

    wrapper.update() // calls forceUpdate
    expect(reducerSpy).to.have.not.been.called
  })

  it('should validate the promise props and throw on invalid values', () => {
    const invalidType = () => {
      const InvalidComp = connect(() => ({
        invalid: {
          type: undefined,
        },
      }))(MyComp)

      mount(
        <Provider store={testStore}>
          <InvalidComp />
        </Provider>
      )
    }

    const invalidMethod = () => {
      const InvalidComp = connect(() => ({
        invalid: {
          type: types.USER,
          method: 'prost',
        },
      }))(MyComp)

      mount(
        <Provider store={testStore}>
          <InvalidComp />
        </Provider>
      )
    }

    expect(invalidType).to.throw(/^Invalid type value/)
    expect(invalidMethod).to.throw(/^Invalid method/)
  })

  it('should provide a pre-configured action creator when using a `create` method ', () => {
    const CreateComponent = connect(() => ({
      createUser: {
        type: types.USER,
        method: 'create',
      },
    }))(MyComp)

    mount(
      <Provider store={testStore}>
        <CreateComponent />
      </Provider>
    )

    // should pass in action creator function as createSubject prop
    expect(renderSpy).to.have.been.calledOnce
    const { createUser } = renderSpy.args[0][0] // first arg of first call
    expect(createUser).to.be.a.function

    // dispatch action
    const body = { firstName: 'Henry' }
    createUser(body)

    // reducer should have been called with that action
    expect(reducerSpy).to.have.been.calledOnce
    expect(reducerSpy).to.have.been.calledWithMatch(
      {},
      {
        type: actionTypes.CREATE_DISPATCH,
        payload: {
          entityType: types.USER,
          body,
          query: {},
        },
      }
    )
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
    const ConnectedCompWithRefs = connect(({ id }) => ({
      traceFetch: {
        type: types.USER,
        id,
      },
    }), { withRef: true })(CompWithRefs)

    it('should return the wrapped instance', () => {
      const wrapper = mount(
        <Provider store={testStore}>
          <ConnectedCompWithRefs id={ data.user.id } />
        </Provider>
      )
      expect(
        wrapper.find(ConnectedCompWithRefs).get(0).getWrappedInstance().refs.myRef
      ).to.exist
    })
  })
})
