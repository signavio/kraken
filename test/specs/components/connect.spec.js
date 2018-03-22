import React, { Component } from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import sinon from 'sinon'
import { normalize } from 'normalizr'

import createConnect from '../../../src/components'
import createActionCreators, { actionTypes } from '../../../src/actions'
import { deriveRequestIdFromAction } from '../../../src/utils'

import expect from '../../expect'

import { types, apiTypes, data } from '../fixtures'

const connect = createConnect(apiTypes)

const { dispatchFetch } = createActionCreators(apiTypes)

const renderSpy = sinon.spy()

const MyComp = props => {
  renderSpy(props)
  return <div />
}

const fetchUserJaneAction = dispatchFetch({
  entityType: types.USER,
  id: 'user-jane',
})

const reducerSpy = sinon.spy((state = {}) => state)
const testStore = createStore(reducerSpy, {
  kraken: {
    requests: {
      [types.USER]: {
        [deriveRequestIdFromAction(fetchUserJaneAction)]: {
          value: 'user-jane',
          fulfilled: true,
          refresh: 2,
        },
      },
    },
    ...normalize(
      {
        id: 'user-jane',
        firstName: 'Jane',
        lastName: 'Doe',
        posts: [
          {
            id: 'post-1',
            name: 'Post 1',
          },
          {
            id: 'post-2',
            name: 'Post 2',
          },
        ],
      },
      apiTypes.USER.schema,
      {}
    ),
  },
})

const TestComponent = connect(
  ({ id, refresh, lazy, fetchOnMount, denormalize }) => ({
    fetchUser: {
      type: types.USER,
      id,
      refresh,
      lazy,
      fetchOnMount,
      denormalize,
    },
  })
)(MyComp)

const TestContainer = props => (
  <Provider store={testStore}>
    <TestComponent {...props} />
  </Provider>
)

describe.only('connect', () => {
  beforeEach(() => {
    renderSpy.reset()
    reducerSpy.reset()
  })

  it('should dispatch the FETCH_DISPATCH action on mount', () => {
    mount(<TestContainer id={data.user.id} />)

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

  it('should set `pending` flag on the injected prop if a request is dispatched', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)
    expect(wrapper.find(MyComp).props().fetchUser).to.have.property(
      'pending',
      true
    )
  })

  it('should set `fulfilled` flag and the value on the injected prop if the enitity is found in cache', () => {
    const wrapper = mount(<TestContainer id="user-jane" />)
    expect(wrapper.find(MyComp).props().fetchUser).to.have.property(
      'fulfilled',
      true
    )
    expect(wrapper.find(MyComp).props().fetchUser.pending).to.be.false
    expect(wrapper.find(MyComp).props().fetchUser.value).to.deep.equal({
      id: 'user-jane',
      firstName: 'Jane',
      lastName: 'Doe',
      posts: ['post-1', 'post-2'],
    })
  })

  it('should dispatch the FETCH_DISPATCH action when the promise props updates', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)
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

  it('should inline referenced data, when denormalize is used.', () => {
    let wrapper = mount(<TestContainer id="user-jane" />)

    expect(wrapper.find(MyComp).props().fetchUser.value).to.deep.equal({
      id: 'user-jane',
      firstName: 'Jane',
      lastName: 'Doe',
      posts: ['post-1', 'post-2'],
    })

    wrapper = mount(<TestContainer denormalize id="user-jane" />)

    expect(wrapper.find(MyComp).props().fetchUser.value).to.deep.equal({
      id: 'user-jane',
      firstName: 'Jane',
      lastName: 'Doe',
      posts: [
        {
          id: 'post-1',
          name: 'Post 1',
        },
        {
          id: 'post-2',
          name: 'Post 2',
        },
      ],
    })
  })

  it('should dispatch FETCH_DISPATCH action if the refresh token is not matching', () => {
    const wrapper = mount(<TestContainer id="user-jane" />)
    expect(reducerSpy).to.have.not.been.called // it's already cached

    wrapper.setProps({ refresh: 3 })
    expect(reducerSpy).to.have.been.calledOnce
  })

  it('should never dispatch FETCH_DISPATCH action if the `lazy` flag is set', () => {
    const wrapper = mount(
      <TestContainer id="id-of-non-cached-item" fetchOnMount lazy />
    )
    expect(reducerSpy).to.have.not.been.called

    wrapper.setProps({ refresh: 3 })
    expect(reducerSpy).to.have.not.been.called
  })

  it('should dispatch FETCH_DISPATCH action if `fetchOnMount` is true', () => {
    mount(<TestContainer id="user-jane" fetchOnMount />)

    expect(reducerSpy).to.have.been.calledOnce
  })

  it('should not dispatch FETCH_DISPATCH action if `fetchOnMount` is false and the value is in cache', () => {
    mount(<TestContainer id="user-jane" fetchOnMount={false} />)

    expect(reducerSpy).to.have.not.been.called
  })

  it('should not dispatch FETCH_DISPATCH action if `fetchOnMount` is only set after mount', () => {
    const wrapper = mount(<TestContainer id="user-jane" />)
    expect(reducerSpy).to.have.not.been.called

    wrapper.setProps({ fetchOnMount: true })
    expect(reducerSpy).to.have.not.been.called
  })

  it('should not dispatch FETCH_DISPATCH action on update when promise props did not change', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)
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
    expect(createUser).to.be.a('function')

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
        return <div ref="myRef">Text</div>
      }
    }
    const ConnectedCompWithRefs = connect(
      ({ id }) => ({
        traceFetch: {
          type: types.USER,
          id,
        },
      }),
      { withRef: true }
    )(CompWithRefs)

    it('should return the wrapped instance', () => {
      const wrapper = mount(
        <Provider store={testStore}>
          <ConnectedCompWithRefs id={data.user.id} />
        </Provider>
      )

      expect(
        wrapper
          .find(ConnectedCompWithRefs)
          .instance(0)
          .getWrappedInstance().refs.myRef
      ).to.exist
    })
  })
})
