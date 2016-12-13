import { put, call } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import expect from '../../expect'

import { createCreateEntity } from '../../../src/sagas/watchCreateEntity'

import actionsCreator from '../../../src/actions'

import { typeUtils } from '../../../src'

import { apiTypes, types, data } from '../fixtures'

const createEntity = createCreateEntity(apiTypes)
const actions = actionsCreator(apiTypes)

const requestId = 'my-request'

describe('Saga - createEntity', () => {
  let generator

  beforeEach(() => {
    generator = createEntity(types.USER, requestId, data.user)
  })

  it('should dispatch a `request` action, using the provided request id', () => {
    expect(generator.next().value).to.deep.equal(
      put(actions.request(types.USER, requestId))
    )
  })

  it('should call the `create` function of the entity type passing in the query object', () => {
    generator.next()

    expect(generator.next().value).to.deep.equal(
      call(typeUtils.getCreate(apiTypes, types.USER), data.user)
    )
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()
    generator.next()

    const { result, entities } = normalize(data.user, apiTypes.USER.schema)

    expect(generator.next({ response: { result, entities } }).value).to.deep.equal(
      put(actions.success(types.USER, requestId, result, entities))
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    // dispatch `request` action
    generator.next()

    // call `fetch` function
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value)
      .to.deep.equal( put(actions.failure(types.USER, requestId, error)) )
  })
})
