import { expect } from 'chai'
import { normalize } from 'normalizr'

import { cachePolicies, actionTypes } from '../../../src'

import { apiTypes } from '../fixtures'

describe('optimistic remove', () => {
  const emptyState = {
    comments: {},
    posts: {},
    users: {},
  }

  const entitiesState = {
    ...emptyState,
    users: {
      e1: {
        id: 'e1',
        name: 'John Doe',
      },
    },
  }

  const typeConstant = 'USER'

  const assertWithWrongType = action =>
    expect(
      cachePolicies.optimisticRemove.updateEntitiesOnAction(
        apiTypes,
        entitiesState,
        action
      )
    ).to.equal(entitiesState)

  const assertWithDeleteType = () =>
    expect(
      cachePolicies.optimisticRemove.updateEntitiesOnAction(
        apiTypes,
        entitiesState,
        {
          type: actionTypes.REMOVE_DISPATCH,
          payload: {
            entityType: typeConstant,
            query: { id: 'e1' },
          },
        }
      )
    ).to.deep.equal(emptyState)

  it('should remove matching entities for remove action.', () => {
    assertWithWrongType({
      type: 'wrong-type',
      payload: {
        entityType: typeConstant,
      },
    })

    assertWithDeleteType()
  })

  it('should only remove entities that match the given query', () => {
    assertWithWrongType({
      type: actionTypes.REMOVE_DISPATCH,
      payload: {
        query: {
          no: 'match',
        },
        entityType: typeConstant,
      },
    })

    assertWithDeleteType()
  })

  it('should only match entities with the correct type.', () => {
    assertWithWrongType({
      type: actionTypes.REMOVE_DISPATCH,
      payload: {
        entityType: 'COMMENT',
      },
    })

    expect(
      cachePolicies.optimisticRemove.updateEntitiesOnAction(
        apiTypes,
        entitiesState,
        {
          type: actionTypes.REMOVE_DISPATCH,
          payload: {
            entityType: typeConstant,
          },
        }
      )
    ).to.deep.equal(emptyState)
  })

  it('should remove self-referential schemas', () => {
    const post = {
      id: 'post-1',
      comments: [
        {
          id: 'comment-1',
          title: 'Comment #1',
        },
        {
          id: 'comment-2',
          title: 'Comment #1',
          parent: { id: 'comment-1' },
        },
      ],
    }

    const { entities: state } = normalize(post, apiTypes.POST.schema)
    const result = cachePolicies.optimisticRemove.updateEntitiesOnAction(
      apiTypes,
      state,
      {
        type: actionTypes.REMOVE_DISPATCH,
        payload: {
          entityType: 'COMMENT',
          query: { id: 'comment-1' },
        },
      }
    )

    const expectedPost = {
      id: 'post-1',
      comments: [
        {
          id: 'comment-2',
          title: 'Comment #1',
        },
      ],
    }
    const { entities: expectedState } = normalize(
      expectedPost,
      apiTypes.POST.schema
    )

    expect(result).to.deep.equal({
      ...emptyState,
      ...expectedState,
    })
    expect(result.posts['post-1'].comments).to.have.length(1)
    expect(result.comments['comment-2'].parent).to.be.undefined
  })
})
