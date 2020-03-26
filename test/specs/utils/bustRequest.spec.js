import { bustRequest } from '../../../src/utils'

import expect from '../../expect'

const URL = 'api/resource'

describe('Utils - bustRequest', () => {
  it('should not append timestamp to requests different than GET.', () => {
    expect(bustRequest(URL, { method: 'DELETE' })).to.be.equal(URL)
    expect(bustRequest(URL, { method: 'PUT' })).to.be.equal(URL)
    expect(bustRequest(URL, { method: 'PATCH' })).to.be.equal(URL)
    expect(bustRequest(URL, { method: 'POST' })).to.be.equal(URL)
  })

  it('should append timestamp to GET requests without query string.', () => {
    const result = bustRequest(URL, {})
    expect(new RegExp(`${URL}\\?_=([0-9])+`, 'g').test(result)).to.be.true
  })

  it('should append timestamp to GET requests with query string.', () => {
    const fullUrl = `${URL}?a=1&b=2`
    const result = bustRequest(fullUrl, {})
    expect(new RegExp(/api\/resource\?a=1&b=2&_=([0-9])+/, 'g').test(result)).to
      .be.true
  })
})
