import { getCachedValue, deriveRequestId } from '../../../src/utils'

import expect from '../../expect'

import { apiTypes, types, data } from '../fixtures'

const query = { id: data.user.id }

describe('Utils - getCachedValue', () => {
  it('should return undefined if no value has been cached.', () => {
    const state = {}

    const result = getCachedValue(apiTypes, state, types.USER, 'fetch', {})

    expect(result).to.be.undefined
  })

  it('should return the cached value if it is in the cache.', () => {
    const state = {
      cache: {
        entities: {
          [apiTypes.USER.collection]: {
            [data.user.id]: data.user,
          },
        },
      },
    }

    const result = getCachedValue(apiTypes, state, types.USER, 'fetch', { query })

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })

  it('should not return a value if the refresh option is set.', () => {
    const state = {
      cache: {
        entities: {
          [apiTypes.USER.collection]: {
            [data.user.id]: data.user,
          },
        },
      },
    }

    let result = getCachedValue(apiTypes, state, types.USER, 'fetch', { query })

    expect(result).to.equal(data.user.id)

    result = getCachedValue(apiTypes, state, types.USER, 'fetch', {
      refresh: true,
      query,
    })

    expect(result).to.be.undefined
  })

  it('should return the current promise value if the value has not been loaded.', () => {
    const state = {
      cache: {
        promises: {
          [types.USER]: {
            [deriveRequestId('fetch', { query })]: {
              value: data.user.id,
            },
          },
        },
      },
    }

    const result = getCachedValue(apiTypes, state, types.USER, 'fetch', { query })

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })
})
