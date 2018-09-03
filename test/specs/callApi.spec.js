import expect from '../expect'

import callApi from '../../src/callApi'

describe('callApi', () => {
  it('should return error when no absolute url provided', async () => {
    const response = await callApi('')

    expect(response).to.eql({
      error: 'Error parsing the response: only absolute urls are supported',
    })
  })
})
