import { normalize } from 'normalizr'

import { getEntityState, getRequestId } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

describe('Utils - getEntityState', () => {
  it('should find the cached entity based on provided action.', () => {
    const query = { id: 'post-1' }

    const requestId = getRequestId('fetch', query, null)

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

    const result = getEntityState(apiTypes, state.kraken, types.POST, requestId)

    expect(result.id).to.equal(data.post.id)
  })

  it('should find the cached entities based on provided action with multiple values.', () => {
    const requestId = getRequestId('fetch', null, null)

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

    const result = getEntityState(
      apiTypes,
      state.kraken,
      types.POSTS,
      requestId
    )

    expect(result).to.have.length(1)

    const post = result[0]

    expect(post.id).to.equal(data.post.id)
  })

  it('should be possible to get the denormalized state.', () => {
    const requestId = getRequestId('fetch', null, null)

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

    const result = getEntityState(apiTypes, state.kraken, types.POST, requestId)

    expect(result.comments).to.deep.equal(
      data.post.comments.map(({ id }) => id)
    )

    const denormalizedResult = getEntityState(
      apiTypes,
      state.kraken,
      types.POST,
      requestId,
      true
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

    const requestId = getRequestId('fetch', {}, {})

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

    const result = getEntityState(
      apiTypes,
      state.kraken,
      types.POSTS,
      requestId
    )

    result.forEach((post, index) => {
      expect(post.comments).to.deep.equal(
        posts[index].comments.map(({ id }) => id)
      )
    })

    const denormalizedResult = getEntityState(
      apiTypes,
      state.kraken,
      types.POSTS,
      requestId,
      true
    )

    expect(denormalizedResult).to.deep.equal(posts)
  })
})
