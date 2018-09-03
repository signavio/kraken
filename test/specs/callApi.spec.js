import fetchMock from 'fetch-mock'
import { startsWith } from 'lodash/fp'

import expect from '../expect'

import callApi from '../../src/callApi'

describe('callApi', () => {
  afterEach(() => {
    fetchMock.restore()
  })
  it('should return error when no absolute url provided', async () => {
    const response = await callApi('')

    expect(response).to.eql({
      error: 'Error parsing the response: only absolute urls are supported',
    })
  })

  it('should return response with result, responseHeaders and entities', async () => {
    fetchMock.get(startsWith('/comments'), {
      body: [{ id: '1', body: 'My first comment' }],
    })

    const { response } = await callApi('/comments', {}, {})

    expect(response).to.have.property('result')
    expect(response).to.have.property('responseHeaders')
    expect(response).to.have.property('entities')
  })
})
