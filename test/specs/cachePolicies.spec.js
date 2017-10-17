import { expect } from 'chai'
import { cachePolicies } from '../../src'

describe('Cache Policies', () => {
  describe('query from cache', () => {
    it('should extend request with cached values', () => {
      const request = {
        value: [],
      }
      const collection = {
        c1: {},
        c2: {},
      }

      const result = cachePolicies.queryFromCache.updateRequestOnCollectionChange(
        request,
        collection
      )

      expect(result.value).to.include('c1')
      expect(result.value).to.include('c2')
    })
    it('should consider the request query when retrieving items', () => {
      const request = {
        value: [],
        query: {
          relationId: 'r1',
        },
      }
      const collection = {
        c1: {},
        c2: {
          relationId: 'r1',
        },
        c3: {
          relationId: 'r2',
        },
      }

      const result = cachePolicies.queryFromCache.updateRequestOnCollectionChange(
        request,
        collection
      )

      expect(result.value).to.include('c2')

      expect(result.value).to.not.include('c1')
      expect(result.value).to.not.include('c3')
    })

    it('should ignore query parameters with `undefined` values when matching', () => {
      const request = {
        value: [],
        query: {
          relationId: 'r1',
          anotherKey: undefined,
        },
      }
      const collection = {
        c1: {},
        c2: {
          relationId: 'r1',
        },
        c3: {
          relationId: 'r2',
        },
      }

      const result = cachePolicies.queryFromCache.updateRequestOnCollectionChange(
        request,
        collection
      )

      expect(result.value).to.include('c2')

      expect(result.value).to.not.include('c1')
      expect(result.value).to.not.include('c3')
    })
  })
})
