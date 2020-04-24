import { normalize } from 'normalizr'

import { actionTypes } from '../../../src/actions'
import { deriveRequestIdFromAction, getEntityState } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

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

    const result = getEntityState(apiTypes, state.kraken, action)

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

    const result = getEntityState(apiTypes, state.kraken, action)

    expect(result).to.have.length(1)

    const post = result[0]

    expect(post.id).to.equal(data.post.id)
  })
})
