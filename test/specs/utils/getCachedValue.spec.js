import { getCachedValue, getRequestId } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

describe('Utils - getCachedValue', () => {
  const requestId = getRequestId('fetch', { id: data.user.id }, null)

  it('should return undefined if no value has been cached.', () => {
    const state = {
      kraken: {
        requests: {},
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state.kraken, types.USER, requestId)

    expect(result).to.be.undefined
  })

  it('should return the cached value if it is in the cache.', () => {
    const state = {
      kraken: {
        requests: {},
        entities: {
          [apiTypes.USER.collection]: {
            [data.user.id]: data.user,
          },
        },
      },
    }

    const result = getCachedValue(apiTypes, state.kraken, types.USER, requestId)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })

  it('should return the current promise value if the value has not been loaded.', () => {
    const state = {
      kraken: {
        requests: {
          [types.USER]: {
            [requestId]: {
              value: data.user.id,
            },
          },
        },
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state.kraken, types.USER, requestId)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })
})
