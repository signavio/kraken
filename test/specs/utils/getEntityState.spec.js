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
        entities: {
          posts: {
            'post-1': data.post,
          },
        },
      },
    }

    const result = getEntityState(apiTypes, state, action)

    expect(result).to.deep.equal(data.post)
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
        entities: {
          posts: {
            'post-1': data.post,
          },
        },
      },
    }

    const result = getEntityState(apiTypes, state, action)

    expect(result).to.deep.equal([data.post])
  })
})
