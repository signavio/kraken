import { getRequestId } from '../../../src/utils'
import expect from '../../expect'

const methods = ['fetch', 'update', 'remove']

describe('getRequestId', () => {
  const query = {
    id: 'abc123',
  }

  const requestParams = {
    offset: 0,
  }

  methods.forEach(method => {
    describe(`dispatch${method}`, () => {
      it('should derive a request id without query and params', () => {
        const requestId = getRequestId(method, null, null)

        expect(requestId).to.equal(`${method.toLowerCase()}_[]`)
      })

      it('should derive a request id with query', () => {
        const requestId = getRequestId(method, query, null)

        expect(requestId).to.equal(`${method.toLowerCase()}_[["id","abc123"]]`)
      })

      it('should derive a request id with request params', () => {
        const requestId = getRequestId(method, null, requestParams)

        expect(requestId).to.equal(`${method.toLowerCase()}_[["offset",0]]`)
      })

      it('should derive a request id with request params and query', () => {
        const requestId = getRequestId(method, query, requestParams)

        expect(requestId).to.equal(
          `${method.toLowerCase()}_[["id","abc123"],["offset",0]]`
        )
      })
    })
  })
})
