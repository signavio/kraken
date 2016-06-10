import expect from '../../expect'

import createActionCreators from '../../../src/actions'

import { typeUtils } from '../../../src'
import { deriveRequestId } from '../../../src/utils'

import {
  createEntitiesReducer,
  createPromisesReducer,
} from '../../../src/reducers'

const testId = 'testSubjectId'

import * as sampleData from '../../data'

import { apiTypes } from '../../types'

const actions = createActionCreators(apiTypes)

export default () => {
  Object.keys(apiTypes).forEach((type) => {
    describe(type, () => {
      dataTest(
        type,
        sampleData[type],
      )
    })
  })
}

const createCleanState = (query) => ({
  cache: {
    promises: {
      ...Object.keys(apiTypes).reduce((prev, key) => ({
        ...prev,
        [key]: {
          [deriveRequestId('fetch', { query })]: {},
        },
      }), {}),
    },
    entities: {
      ...Object.keys(apiTypes).reduce((prev, key) => ({
        ...prev,
        [typeUtils.getCollection(apiTypes, key)]: {},
      }), {}),
    },
  },
})
const dataTest = (type, value) => {
  const query = { id: testId }
  const requestId = deriveRequestId('fetch', { query })
  const collection = typeUtils.getCollection(apiTypes, type)
  // const entityReducerForEntity = entityReducer(entity)

  describe('promiseReducer', () => {
    const promiseReducerForEntity = createPromisesReducer(apiTypes, type)

    it('FETCH_ENTITY', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[type],
        actions.fetchEntity(type, query)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('REQUEST', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.request(type, requestId)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })

    it('CACHE_HIT', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.cacheHit(type, query, value.response.result)
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.equal(value.response.result)

    })

    it('SUCCESS', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.success(type, requestId, value.response.result, value.response.entities)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.equal(value.response.result)
    })

    it('FAILURE', () => {
      const error = 'the error message'
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.failure(type, requestId, error)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', false)
      expect(newState[requestId]).to.have.property('rejected', true)
      expect(newState[requestId]).to.have.property('reason', error)
    })

  })

  describe('entityReducer', () => {
    const entityReducerForEntity = createEntitiesReducer(apiTypes, type)

    it('SUCCESS with entities', () => {
      const newState = entityReducerForEntity(
        createCleanState(query).cache.entities[collection],
        actions.success(type, requestId, value.response.result, value.response.entities),
      )

      expect(newState).to.deep.equal(value.response.entities[collection])
    })

  })
}
