import { getCachedValue, deriveRequestIdFromAction } from '../../../src/utils'

import expect from '../../expect'

import { apiTypes, types, data } from '../fixtures'

const fetchAction = { type: 'FETCH_DISPATCH', payload: { entityType: types.USER, query: { id: data.user.id } } }

describe('Utils - getCachedValue', () => {
  it('should return undefined if no value has been cached.', () => {
    const state = {
      genericApi: {
        requests: {},
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state, fetchAction)

    expect(result).to.be.undefined
  })

  it('should return the cached value if it is in the cache.', () => {
    const state = {
      genericApi: {
        requests: {},
        entities: {
          [apiTypes.USER.collection]: {
            [data.user.id]: data.user,
          },
        },
      },
    }

    const result = getCachedValue(apiTypes, state, fetchAction)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })

  it('should not return a value if the refresh option is set.', () => {
    const state = {
      genericApi: {
        requests: {},
        entities: {
          [apiTypes.USER.collection]: {
            [data.user.id]: data.user,
          },
        },
      },
    }

    let result = getCachedValue(apiTypes, state, fetchAction)

    expect(result).to.equal(data.user.id)

    result = getCachedValue(apiTypes, state, {
      type: fetchAction.type,
      payload: {
        ...fetchAction.payload,
        refresh: true,
      },
    })

    expect(result).to.be.undefined
  })

  it('should return the current promise value if the value has not been loaded.', () => {
    const state = {
      genericApi: {
        requests: {
          [types.USER]: {
            [deriveRequestIdFromAction(fetchAction)]: {
              value: data.user.id,
            },
          },
        },
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state, fetchAction)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })
})
