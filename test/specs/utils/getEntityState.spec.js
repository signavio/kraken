import { normalize } from 'normalizr'

import expect from '../../expect'
import { actionTypes } from '../../../src/actions'
import { deriveRequestIdFromAction, getEntityState } from '../../../src/utils'
import { apiTypes, types, data } from '../fixtures'

describe('Utils - getEntityState', () => {
  it('should find the cached entity based on provided action.', () => {
    const action = {
      action: actionTypes.FETCH_DISPATCH,
      payload: { query: { id: 'post-1' }, entityType: types.POST },
    }

    const requestId = deriveRequestIdFromAction(action)

    const state = {
      kraken: {
        requests: {
          [types.POST]: {
            [requestId]: { fulfilled: true, value: 'post-1' },
          },
        },
        ...normalize(data.post, apiTypes.POST.schema, {}),
      },
    }

    const result = getEntityState(apiTypes, state, action)

    expect(result.id).to.equal(data.post.id)
  })

  it('should find the cached entities based on provided action with multiple values.', () => {
    const action = {
      action: actionTypes.FETCH_DISPATCH,
      payload: { entityType: types.POSTS },
    }

    const requestId = deriveRequestIdFromAction(action)

    const state = {
      kraken: {
        requests: {
          [types.POSTS]: {
            [requestId]: { fulfilled: true, value: ['post-1'] },
          },
        },
        ...normalize([data.post], apiTypes.POSTS.schema, {}),
      },
    }

    const result = getEntityState(apiTypes, state, action)

    expect(result).to.have.length(1)

    const post = result[0]

    expect(post.id).to.equal(data.post.id)
  })

  it('should be possible to get the denormalized state.', () => {
    const action = {
      action: actionTypes.FETCH_DISPATCH,
      payload: { entityType: types.POST },
    }

    const requestId = deriveRequestIdFromAction(action)

    const state = {
      kraken: {
        requests: {
          [types.POST]: {
            [requestId]: { fulfilled: true, value: 'post-1' },
          },
        },
        ...normalize(data.post, apiTypes.POST.schema, {}),
      },
    }

    const result = getEntityState(apiTypes, state, action)

    expect(result.comments).to.deep.equal(
      data.post.comments.map(({ id }) => id)
    )

    const denormalizeAction = {
      action: actionTypes.FETCH_DISPATCH,
      payload: {
        entityType: types.POST,
        denormalizeValue: true,
      },
    }

    const denormalizedResult = getEntityState(
      apiTypes,
      state,
      denormalizeAction
    )

    expect(denormalizedResult.comments).to.deep.equal(data.post.comments)
  })

  it('should be possible to denormalize arrays', () => {
    const posts = [
      {
        id: 'post-1',
        title: '#1 title',
        comments: [{ id: 'comment-1', body: 'Comment #1 body' }],
      },
      {
        id: 'post-2',
        title: '#2 title',
        comments: [{ id: 'comment-2', body: 'Comment #2 body' }],
      },
      {
        id: 'post-3',
        title: '#3 title',
        comments: [{ id: 'comment-3', body: 'Comment #3 body' }],
      },
    ]

    const action = {
      action: actionTypes.FETCH_DISPATCH,
      payload: { entityType: types.POSTS },
    }

    const requestId = deriveRequestIdFromAction(action)

    const state = {
      kraken: {
        requests: {
          [types.POSTS]: {
            [requestId]: {
              fulfilled: true,
              value: ['post-1', 'post-2', 'post-3'],
            },
          },
        },
        ...normalize(posts, apiTypes.POSTS.schema, {}),
      },
    }

    const result = getEntityState(apiTypes, state, action)

    result.forEach((post, index) => {
      expect(post.comments).to.deep.equal(
        posts[index].comments.map(({ id }) => id)
      )
    })

    const denormalizeAction = {
      action: actionTypes.FETCH_DISPATCH,
      payload: {
        entityType: types.POSTS,
        denormalizeValue: true,
      },
    }

    const denormalizedResult = getEntityState(
      apiTypes,
      state,
      denormalizeAction
    )

    expect(denormalizedResult).to.deep.equal(posts)
  })
})
