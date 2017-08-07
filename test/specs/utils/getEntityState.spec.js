import expect from '../../expect'
import { getEntityState } from '../../../src/utils'

import { apiTypes, types } from '../fixtures'

describe('EntityState', () => {
  it('should denormalize related types for single entity', () => {
    const comment = {
      id: 'c1',
      name: 'Comment C1',
    }

    const post = {
      id: 'p1',
      name: 'Post 1',
      comments: [comment],
    }

    const state = {
      kraken: {
        entities: {
          comments: {
            c1: comment,
          },
          posts: {
            p1: {
              id: 'p1',
              name: 'Post 1',
              comments: ['c1'],
            },
          },
        },
        requests: {},
      },
    }

    const action = {
      payload: {
        entityType: types.POST,
      },
    }

    expect(getEntityState(apiTypes, state, action)).to.eql(post)
  })

  it('should denormalize related types for a collection', () => {
    const comment = {
      id: 'c1',
      name: 'Comment C1',
    }

    const post = {
      id: 'p1',
      name: 'Post 1',
      comments: [comment],
    }

    const state = {
      kraken: {
        entities: {
          comments: {
            c1: comment,
          },
          posts: {
            p1: {
              id: 'p1',
              name: 'Post 1',
              comments: ['c1'],
            },
          },
        },
        requests: {
          [types.POSTS]: {
            p1Request: {
              value: ['p1'],
            },
          },
        },
      },
    }

    const action = {
      payload: {
        entityType: types.POSTS,
        requestId: 'p1Request',
      },
    }

    expect(getEntityState(apiTypes, state, action)).to.eql([post])
  })
})
