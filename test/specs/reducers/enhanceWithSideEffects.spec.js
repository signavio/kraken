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

  describe('remove action', () => {
    it('should remove from to-many references', () => {
      const state = reducer(
        {
          entities: {
            comments: {
              'comment-1': {
                id: 'comment-1',
                body: 'comment 1 body',
              },
            },
            posts: {
              'post-1': {
                id: 'post-1',
                name: 'post 1 name',
                comments: ['comment-1'],
              },
            },
          },
          requests: {
            USER: {},
            USERS: {},
            COMMENT: {},
            POST: {},
            POSTS: {
              fetch_xyz: {
                fulfilled: true,
                value: ['post-1', 'post-2'],
              },
            },
          },
        },
        actions.dispatchRemove({
          entityType: types.COMMENT,
          query: { id: 'comment-1' },
        })
      )

      expect(state.entities.comments).to.be.empty
      expect(state.entities.posts['post-1'].comments).to.be.empty
    })
  })
})
