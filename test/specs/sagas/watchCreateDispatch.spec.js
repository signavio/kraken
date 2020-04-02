import { normalize } from 'normalizr'
import { put } from 'redux-saga/effects'

import actionsCreator, { actionTypes } from '../../../src/actions'
import { createCreateDispatch } from '../../../src/sagas/watchCreateDispatch'
import { deriveRequestIdFromAction } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

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

const state = {
  kraken: {
    requests: {
      [types.USER]: {
        [requestId]: {
          outstanding: true,
        },
      },
    },
    entities: {
      [types.USER]: {},
    },

    metaData: {},
  },
}

const getState = () => state

describe('Saga - createEntity', () => {
  let generator

  beforeEach(() => {
    generator = createEntity(createAction, getState)
  })

  it('should call the `create` function of the entity type passing in the query object', () => {
    expect(generator.next().value.payload)
      .to.have.property('args')
      .that.is.eql([{}, body, undefined])
  })

  it('should dispatch the `success` action with the server response data', () => {
    generator.next()

    const { result, entities } = normalize(body, apiTypes.USER.schema)

    expect(
      generator.next({ response: { result, entities } }).value
    ).to.deep.equal(
      put(
        actions.succeedCreate({
          entityType,
          requestId: deriveRequestIdFromAction(createAction),
          value: result,
          entities,
        })
      )
    )
  })

  it('should dispatch an `error` action if the server request fails', () => {
    generator.next()

    const error = 'Some error message'

    expect(generator.next({ error }).value).to.deep.equal(
      put(actions.failCreate({ entityType: types.USER, requestId, error }))
    )
  })

  it('should dispatch an `error` action even if the error message is empty', () => {
    generator.next()

    const error = ''

    expect(generator.next({ error }).value).to.deep.equal(
      put(actions.failCreate({ entityType: types.USER, requestId, error }))
    )
  })

  it('should not create an `error` if the server returns an empty response.', () => {
    generator.next()

    const response = null

    expect(generator.next({ response }).value).to.not.deep.equal(
      put(actions.failCreate({ entityType: types.USER, requestId }))
    )
  })

  it('should create an empty action if the server responds with an empty result.', () => {
    generator.next()

    const response = null

    expect(generator.next({ response }).value).to.deep.equal(
      put(
        actions.succeedCreate({
          entityType: types.USER,
          requestId,
          value: undefined,
          entities: {},
        })
      )
    )
  })
})
