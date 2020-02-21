import { mount } from 'enzyme'
import { normalize } from 'normalizr'
import React, { Fragment } from 'react'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import sinon from 'sinon'

import { actionTypes } from '../../../src/actions'
import { createUseFetch } from '../../../src/hooks'
import createReducer from '../../../src/reducers'
import { getRequestId } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

const useFetch = createUseFetch(apiTypes)
const reducer = createReducer(apiTypes)

const renderSpy = sinon.spy()

const Posts = () => null
const User = () => null

const TestComponent = props => {
  const { id, refresh, lazy, denormalize } = props

  const [fetchUser] = useFetch(types.USER, id, { refresh, lazy, denormalize })

  if (fetchUser.pending) {
    return 'Pending'
  }

  if (fetchUser.rejected) {
    return `Rejected ${fetchUser.reason}`
  }

  if (fetchUser.fulfilled) {
    return (
      <Fragment>
        <User value={fetchUser.value} />
        <Posts value={fetchUser.value.posts} />
      </Fragment>
    )
  }

  return 'Nothings happening'
}

const posts = [
  {
    id: 'post-1',
    name: 'Post 1',
  },
  {
    id: 'post-2',
    name: 'Post 2',
  },
]

const jane = {
  id: 'user-jane',
  firstName: 'Jane',
  lastName: 'Doe',
  posts,
}

const { entities } = normalize(jane, apiTypes.USER.schema, {})

const initialState = {
  kraken: {
    requests: {
      [types.USER]: {
        [getRequestId('fetch', { id: jane.id }, {})]: {
          value: jane.id,
          fulfilled: true,
          refresh: 2,
        },
      },
    },
    entities,
  },
}

const reducerSpy = sinon.spy((state, action) => reducer(state, action))

describe('useFetch', () => {
  let testStore
  let TestContainer

  beforeEach(() => {
    testStore = createStore(
      combineReducers({ kraken: reducerSpy }),
      initialState
    )

    TestContainer = props => (
      <Provider store={testStore}>
        <TestComponent {...props} />
      </Provider>
    )

    renderSpy.resetHistory()
    reducerSpy.resetHistory()
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
    let component

    act(() => {
      component = mount(<TestContainer id={data.user.id} />)
    })

    expect(component.text()).to.equal('Pending')
  })

  it('should set `fulfilled` flag and the value on the injected prop if the enitity is found in cache', () => {
    let component

    act(() => {
      component = mount(<TestContainer id="user-jane" />)
    })

    expect(component.find(User).prop('value')).to.eql({
      ...jane,
      posts: posts.map(({ id }) => id),
    })
  })

  it('should dispatch the FETCH_DISPATCH action when the promise props updates', () => {
    const wrapper = mount(<TestContainer id={data.user.id} />)
    reducerSpy.resetHistory()

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
    const component = mount(<TestContainer id="user-jane" />)

    expect(reducerSpy).to.have.not.been.called // it's already cached

    act(() => {
      component.setProps({ refresh: 3 })
    })

    expect(reducerSpy).to.have.been.calledOnce
  })

  it('should never dispatch FETCH_DISPATCH action if the `lazy` flag is set', () => {
    const wrapper = mount(<TestContainer id="id-of-non-cached-item" lazy />)
    expect(reducerSpy).to.have.not.been.called

    wrapper.setProps({ refresh: 3 })
    expect(reducerSpy).to.have.not.been.called
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

  it('should validate the promise props and throw on invalid values', () => {
    const InvalidType = () => {
      useFetch(undefined)

      return null
    }

    const invalidType = () => {
      mount(
        <Provider store={testStore}>
          <InvalidType />
        </Provider>
      )
    }

    expect(invalidType).to.throw(/^Invalid type value/)
  })

  // it('should provide a pre-configured action creator when using a `create` method ', () => {
  //   const body = { firstName: 'Henry' }

  //   const CreateComponent = () => {
  //     const createUser = useFetch(types.USER, { method: 'create' })

  //     return <button onClick={() => createUser(body)}>Click me</button>
  //   }

  //   const component = mount(
  //     <Provider store={testStore}>
  //       <CreateComponent />
  //     </Provider>
  //   )

  //   expect(reducerSpy).not.to.have.been.called

  //   component.find('button').simulate('click')

  //   // reducer should have been called with that action
  //   expect(reducerSpy).to.have.been.calledOnce
  //   expect(reducerSpy).to.have.been.calledWithMatch(
  //     {},
  //     {
  //       type: actionTypes.CREATE_DISPATCH,
  //       payload: {
  //         entityType: types.USER,
  //         body,
  //         query: {},
  //       },
  //     }
  //   )
  // })

  // it('should be possible to pass a callback for when the request succeeds.', () => {
  //   const onSuccess = sinon.spy()

  //   const Component = () => {
  //     useFetch(types.USER, { id: 'some-user', onSuccess })

  //     return null
  //   }

  //   mount(
  //     <Provider store={testStore}>
  //       <Component />
  //     </Provider>
  //   )

  //   expect(onSuccess).not.to.have.been.called

  //   act(() => {
  //     testStore.dispatch(
  //       succeedFetch({
  //         entityType: types.USER,
  //         requestId: getRequestId('fetch', { id: 'some-user' }, {}),
  //       })
  //     )
  //   })

  //   expect(onSuccess).to.have.been.calledOnce
  // })

  // it('should be possible to pass a callback for when a request fails.', () => {
  //   const onFailure = sinon.spy()

  //   const Component = () => {
  //     useFetch(types.USER, 'some-user')

  //     return null
  //   }

  //   mount(
  //     <Provider store={testStore}>
  //       <Component />
  //     </Provider>
  //   )

  //   expect(onFailure).not.to.have.been.called

  //   testStore.dispatch(
  //     failFetch({
  //       entityType: types.USER,
  //       requestId: getRequestId('fetch', { id: 'some-user' }, {}),
  //     })
  //   )

  //   expect(onFailure).not.to.have.been.calledOnce
  // })
})
