import { normalize } from 'normalizr'
import { put } from 'redux-saga/effects'

import actionsCreator, { actionTypes } from '../../../src/actions'
import { createUpdateDispatch } from '../../../src/sagas/watchUpdateDispatch'
import { deriveRequestIdFromAction } from '../../../src/utils'
import expect from '../../expect'
import { apiTypes, data, types } from '../fixtures'

const updateEntity = createUpdateDispatch(apiTypes)
const actions = actionsCreator(apiTypes)

const entityType = types.USER
const query = {}
const body = data.user

const updatePayload = {
  entityType,
  body,
  query,
}

const createAction = {
  type: actionTypes.CREATE_DISPATCH,
  payload: updatePayload,
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

describe('Saga - updateEntity', () => {
  let generator

  beforeEach(() => {
    generator = updateEntity(createAction, getState)
  })

  it('should call the `update` function of the entity type passing in the query object', () => {
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
        actions.succeedUpdate({
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
      put(actions.failUpdate({ entityType: types.USER, requestId, error }))
    )
  })

  it('should dispatch an `error` action even if the error message is empty', () => {
    generator.next()

    const error = ''

    expect(generator.next({ error }).value).to.deep.equal(
      put(actions.failUpdate({ entityType: types.USER, requestId, error }))
    )
  })

  it('should not create an `error` if the server returns an empty response.', () => {
    generator.next()

    const response = null

    expect(generator.next({ response }).value).to.not.deep.equal(
      put(actions.failUpdate({ entityType: types.USER, requestId }))
    )
  })

  it('should create an empty action if the server responds with an empty result.', () => {
    generator.next()

    const response = null

    expect(generator.next({ response }).value).to.deep.equal(
      put(
        actions.succeedUpdate({
          entityType: types.USER,
          requestId,
          value: undefined,
          entities: {},
        })
      )
    )
  })
})
