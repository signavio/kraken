import { mount } from 'enzyme'
import { normalize } from 'normalizr'
import React, { Fragment } from 'react'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import sinon from 'sinon'

import createActionCreators, { actionTypes } from '../../../src/actions'
import createUseApi from '../../../src/hooks'
import { deriveRequestIdFromAction } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

const useApi = createUseApi(apiTypes)

const { dispatchFetch } = createActionCreators(apiTypes)

const renderSpy = sinon.spy()

const Posts = () => null
const User = () => null

const TestComponent = props => {
  const { id, refresh, lazy, denormalize } = props

  const fetchUser = useApi(types.USER, { id, refresh, lazy, denormalize })

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

const fetchUserJaneAction = dispatchFetch({
  entityType: types.USER,
  id: 'user-jane',
})

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
    ...normalize(jane, apiTypes.USER.schema, {}),
  },
})

const TestContainer = props => (
  <Provider store={testStore}>
    <TestComponent {...props} />
  </Provider>
)

describe('useApi', () => {
  beforeEach(() => {
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

  it('should inline referenced data, when denormalize is used.', () => {
    let component

    act(() => {
      component = mount(<TestContainer id="user-jane" />)
    })

    expect(component.find(Posts).prop('value')).to.eql(
      posts.map(({ id }) => id)
    )

    act(() => {
      component = mount(<TestContainer denormalize id="user-jane" />)
    })

    expect(component.find(Posts).prop('value')).to.eql(posts)
  })

  it('should dispatch FETCH_DISPATCH action if the refresh token is not matching', () => {
    let component

    act(() => {
      component = mount(<TestContainer id="user-jane" />)
    })

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
      useApi(undefined)
    }

    const InvalidMethod = () => {
      useApi(types.USER, { method: 'prost' })
    }

    const invalidType = () => {
      mount(
        <Provider store={testStore}>
          <InvalidType />
        </Provider>
      )
    }

    const invalidMethod = () => {
      mount(
        <Provider store={testStore}>
          <InvalidMethod />
        </Provider>
      )
    }

    expect(invalidType).to.throw(/^Invalid type value/)
    expect(invalidMethod).to.throw(/^Unkown method prost/)
  })

  it('should provide a pre-configured action creator when using a `create` method ', () => {
    const body = { firstName: 'Henry' }

    const CreateComponent = () => {
      const createUser = useApi(types.USER, { method: 'create' })

      return <button onClick={() => createUser(body)}>Click me</button>
    }

    const component = mount(
      <Provider store={testStore}>
        <CreateComponent />
      </Provider>
    )

    expect(reducerSpy).not.to.have.been.called

    component.find('button').simulate('click')

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
})
