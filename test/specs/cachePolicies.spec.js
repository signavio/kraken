import { expect } from 'chai'
import { cachePolicies, actionTypes } from '../../src'

describe('Cache Policies', () => {
  describe('optimistic remove', () => {
    const entity = {
      id: 'e1',
      name: 'John Doe',
    }

    const typeConstant = 'USER'

    it('should only match remove actions.', () => {
      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: 'wrong-type',
            payload: {
              entityType: typeConstant,
            },
          }
        )
      ).to.equal(entity)

      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: actionTypes.REMOVE_DISPATCH,
            payload: {
              entityType: typeConstant,
            },
          }
        )
      ).to.be.undefined
    })

    it('should only match entities that match a given query', () => {
      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: actionTypes.REMOVE_DISPATCH,
            payload: {
              query: {
                no: 'match',
              },
              entityType: typeConstant,
            },
          }
        )
      ).to.equal(entity)

      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: actionTypes.REMOVE_DISPATCH,
            payload: {
              query: { id: 'e1' },
              entityType: typeConstant,
            },
          }
        )
      ).to.be.undefined
    })

    it('should only match entities with the correct type.', () => {
      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: actionTypes.REMOVE_DISPATCH,
            payload: {
              entityType: 'wrong-type',
            },
          }
        )
      ).to.equal(entity)

      expect(
        cachePolicies.optimisticRemove.updateEntityOnAction(
          typeConstant,
          entity,
          {
            type: actionTypes.REMOVE_DISPATCH,
            payload: {
              entityType: typeConstant,
            },
          }
        )
      ).to.be.undefined
    })
  })

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

    it('should also return matching cached ids if value is still undefined', () => {
      const request = {}
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
