import { combineReducers } from 'redux'

import expect from '../../expect'

import createEnhanceWithSideEffects from '../../../src/reducers/enhanceWithSideEffects'
import createActionCreators from '../../../src/actions'
import { apiTypes, types } from '../fixtures'

const actions = createActionCreators(apiTypes)
const enhanceWithSideEffects = createEnhanceWithSideEffects(apiTypes)

const baseReducer = combineReducers({
  entities: (state = {}) => state,
  requests: (state = {}) => state,
})

describe('enhanceWithSideEffects', () => {
  const reducer = enhanceWithSideEffects(baseReducer)

  it('should apply the side effects reducers in the correct state structure', () => {
    const initialState = reducer({}, { type: '@@redux/PROBE_UNKNOWN_ACTION' })
    expect(initialState).to.deep.equal({
      entities: { users: {}, posts: {}, comments: {} },
      requests: { USER: {}, USERS: {}, POST: {}, POSTS: {}, COMMENT: {} },
    })
  })

  describe('`removeOnRemoveDispatch` cache policy (default for entity types)', () => {
    it('should remove the entity from the cache on REMOVE_DISPATCH', () => {
      const state = reducer(
        {
          entities: {
            users: {
              user1: { id: 'user1' },
            },
            posts: {},
          },
          requests: { USER: {}, USERS: {}, POST: {}, POSTS: {} },
        },
        actions.dispatchRemove({
          entityType: types.USER,
          query: { id: 'user1' },
        })
      )
      expect(state.entities.users).to.not.have.property('user1')
    })
  })

  describe('`removeDeleted` cache policy (default for array types)', () => {
    it("should remove the deleted entities' ids from the request results", () => {
      const state = reducer(
        {
          entities: {
            users: {
              user1: { id: 'user1' },
              user2: { id: 'user2' },
            },
            posts: {},
          },
          requests: {
            USER: {},
            USERS: {
              fetch_xyz: {
                fulfilled: true,
                value: ['user1', 'user2'],
              },
            },
            POST: {},
            POSTS: {},
          },
        },
        actions.dispatchRemove({
          entityType: types.USER,
          query: { id: 'user1' },
        })
      )
      expect(state.entities.users).to.not.have.property('user1')
      expect(state.requests.USERS.fetch_xyz.value).to.deep.equal(['user2'])
    })
  })
})
