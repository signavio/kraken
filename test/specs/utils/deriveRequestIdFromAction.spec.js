import createActionCreators from '../../../src/actions'
import { deriveRequestIdFromAction } from '../../../src/utils'

import expect from '../../expect'

import { apiTypes, types } from '../fixtures'

const actionTypes = ['Fetch', 'Update', 'Remove']

const actions = createActionCreators(apiTypes)

describe('deriveRequestIdFromAction', () => {
  const query = {
    id: 'abc123',
  }

  const requestParams = {
    offset: 0,
  }

  const createAction = (actionType, payload) =>
    actions[`dispatch${actionType}`]({
      entityType: types.USER,
      ...payload,
    })

  actionTypes.forEach((actionType) => {
    describe(`dispatch${actionType}`, () => {
      it('should derive a request id without query and params', () => {
        const action = createAction(actionType)

        const requestId = deriveRequestIdFromAction(action)

        expect(requestId).to.equal(`${actionType.toLowerCase()}_`)
      })

      it('should derive a request id with query', () => {
        const action = createAction(actionType, { query })

        const requestId = deriveRequestIdFromAction(action)

        expect(requestId).to.equal(
          `${actionType.toLowerCase()}_["id","abc123"]`
        )
      })

      it('should derive a request id with request params', () => {
        const action = createAction(actionType, { requestParams })

        const requestId = deriveRequestIdFromAction(action)

        expect(requestId).to.equal(`${actionType.toLowerCase()}_["offset",0]`)
      })

      it('should derive a request id with request params and query', () => {
        const action = createAction(actionType, { query, requestParams })

        const requestId = deriveRequestIdFromAction(action)

        expect(requestId).to.equal(
          `${actionType.toLowerCase()}_["id","abc123"]["offset",0]`
        )
      })
    })
  })
})
