import { put, call } from 'redux-saga/effects'
import { normalize } from 'normalizr'

import expect from '../../expect'

import { createCreateDispatch } from '../../../src/sagas/watchCreateDispatch'

import actionsCreator, { actionTypes } from '../../../src/actions'

import { deriveRequestIdFromAction } from '../../../src/utils'

import { typeUtils } from '../../../src'

import { apiTypes, types, data } from '../fixtures'

const createEntity = createCreateDispatch(apiTypes)
const actions = actionsCreator(apiTypes)

const entityType = types.USER
const query = {}
const elementId = 'elementId'
const body = data.user

const createPayload = {
  entityType,
  body,
  query,
  elementId,
}

const createAction = {
  type: actionTypes.CREATE_DISPATCH,
  payload: createPayload,
}

const requestId = deriveRequestIdFromAction(createAction)

describe('Saga - createEntity', () => {
  let generator

  beforeEach(() => {
    generator = createEntity(createAction)
  })

  it('should call the `create` function of the entity type passing in the query object', () => {
    expect(generator.next().value).to.deep.equal(
      call(typeUtils.getCreate(apiTypes, types.USER), body)
    )
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()

    const { result, entities } = normalize(body, apiTypes.USER.schema)

    expect(generator.next({ response: { result, entities } }).value).to.deep.equal(
      put(actions.succeedCreate({
        entityType,
        requestId: deriveRequestIdFromAction(createAction),
        value: result,
        entities,
      }))
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value)
      .to.deep.equal(put(actions.failCreate({ entityType: types.USER, requestId, error })))
  })
})
