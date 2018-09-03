import expect from '../../expect'

import getTypeNames from '../../../src/types/getTypeNames'

describe('getTypeNames', () => {
  it('should get type names', () => {
    const ApiType = {
      TEST_TYPE: { collection: 'test' },
    }
    expect(getTypeNames(ApiType)).to.eql({ TEST_TYPE: 'TEST_TYPE' })
  })
})
