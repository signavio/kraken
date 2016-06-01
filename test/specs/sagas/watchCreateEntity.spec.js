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
      const requestId = 'myReqId'

      const gen = createEntity(type, body, requestId)

      it('should dispatch a `request` action, using the provided request id', () => {
        const genNext = gen.next()
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
      const requestId = 'myReqId2'

      const gen = createEntity(type, body, requestId)

      gen.next() // dispatch `request` action
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
