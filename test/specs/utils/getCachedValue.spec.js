import { actionTypes } from '../../../src/actions'
import { getCachedValue, getRequestId } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

const fetchAction = {
  type: actionTypes.FETCH_DISPATCH,
  payload: { entityType: types.USER, query: { id: data.user.id } },
}

describe('Utils - getCachedValue', () => {
  it('should return undefined if no value has been cached.', () => {
    const state = {
      kraken: {
        requests: {},
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state.kraken, fetchAction)

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

    const result = getCachedValue(apiTypes, state.kraken, fetchAction)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })

  it('should return the current promise value if the value has not been loaded.', () => {
    const state = {
      kraken: {
        requests: {
          [types.USER]: {
            [getRequestId('fetch', { id: data.user.id }, {})]: {
              value: data.user.id,
            },
          },
        },
        entities: {},
      },
    }

    const result = getCachedValue(apiTypes, state.kraken, fetchAction)

    expect(result).to.not.be.undefined
    expect(result).to.equal(data.user.id)
  })
})
