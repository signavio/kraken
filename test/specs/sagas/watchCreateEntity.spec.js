/* eslint-disable no-unused-expressions */

import {
  put,
  call,
} from 'redux-saga/effects'

import expect from '../../expect'

import { createCreateEntity } from '../../../src/sagas/watchCreateEntity'

import actionsCreator from '../../../src/actions'

import { typeUtils } from '../../../src'

import * as sampleData from '../../data'

import { apiTypes } from '../../types'

const createEntity = createCreateEntity(apiTypes)
const actions = actionsCreator(apiTypes)

export default () => {
  Object.keys(apiTypes).forEach((type) => {
    // skip types that have no create method implementation
    if (!apiTypes[type].create) return

    describe(type, () => {
      genericTest(
        type,
        sampleData[type],
      )
    })
  })
}

const genericTest = (type, data) => {

  describe('createEntity', () => {

    describe('happy path', () => {
      const body = { title: 'foo' }
      let requestId

      const gen = createEntity(type, body)

      it('should dispatch a `request` action, generating a unique request id', () => {
        const genNext = gen.next()
        requestId = genNext.value.PUT.action.payload.requestId
        expect(requestId).to.exist
        expect(genNext.value).to.deep.equal(
          put(actions.request(type, requestId))
        )
      })

      it('should call the `create` function of the entity type passing in the query object', () => {
        const genNext = gen.next()
        expect(genNext.value).to.deep.equal(
          call(typeUtils.getCreate(apiTypes, type), body)
        )
      })

      it('should dispatch the `success` action with the server response data', () => {
        const { response } = data
        const genNext = gen.next(data)
        expect(genNext.value).to.deep.equal(
          put(actions.success(type, requestId, response.result, response.entities))
        )
      })
    })

    describe('server failure', () => {
      const body = { title: 'foo' }
      const gen = createEntity(type, body)

      const genNext = gen.next() // dispatch `request` action
      const requestId = genNext.value.PUT.action.payload.requestId
      gen.next() // call `fetch` function

      it('should dispatch an `error` action if the server request fails', () => {

        const error = 'Some error message'
        const genNext = gen.next({ error }) // simulate server error
        expect(genNext.value)
          .to.deep.equal( put(actions.failure(type, requestId, error)) )
      })
    })

  })

}
