import { expect } from 'chai'

import { cachePolicies } from '../../../src'

import { apiTypes } from '../fixtures'

describe('removeReferencesToDeletedEntities', () => {
  const entityTypeConstant = 'USER'
  const arrayTypeConstant = 'USERS'

  it('should remove ids from removed entities for array schemas', () => {
    const request = {
      value: ['u1', 'u2'],
    }

    const collection = {
      u1: {},
    }

    const result = cachePolicies.removeReferencesToDeletedEntities.updateRequestOnCollectionChange(
      apiTypes,
      request,
      collection,
      arrayTypeConstant
    )

    expect(result.value).to.include('u1')
    expect(result.value).to.not.include('u2')
  })

  it('should reset the value completely for entity schemas', () => {
    const request = {
      value: 'u1',
    }

    const collection = {
      u2: {},
    }

    const result = cachePolicies.removeReferencesToDeletedEntities.updateRequestOnCollectionChange(
      apiTypes,
      request,
      collection,
      entityTypeConstant
    )

    expect(result.value).to.be.undefined
  })

  it('should not reset the value if the entity is still present.', () => {
    const request = {
      value: 'u1',
    }

    const collection = {
      u1: {},
    }

    const result = cachePolicies.removeReferencesToDeletedEntities.updateRequestOnCollectionChange(
      apiTypes,
      request,
      collection,
      entityTypeConstant
    )

    expect(result.value).to.equal('u1')
  })
})
