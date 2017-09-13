import expect from '../../expect'

import stringifyQuery from '../../../src/utils/stringifyQuery'

describe('Utils - stringifyQuery', () => {
  it('should always generate the same string no matter the order of keys', () => {
    const query = {
      parentId: 'bar',
      id: 'foo',
    }
    const queryInDifferentOrder = {
      id: 'foo',
      parentId: 'bar',
    }

    const stringified = stringifyQuery(query)
    const stringifiedInDifferentOrder = stringifyQuery(queryInDifferentOrder)

    expect(stringified).to.equal('["id","foo"]["parentId","bar"]')
    expect(stringified).to.equal(stringifiedInDifferentOrder)
  })
})
