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

import { apiTypes, default as types } from '../../types'

const actions = createActionCreators(apiTypes)


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

export default () => {
  const query = { id: testId }
  const requestId = deriveRequestId('fetch', { query })
  const collection = typeUtils.getCollection(apiTypes, types.Case)
  // const entityReducerForEntity = entityReducer(entity)

  describe('promiseReducer', () => {
    const promiseReducerForEntity = createPromisesReducer(apiTypes, types.Case)

    it('FETCH_ENTITY', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[types.Case],
        actions.fetchEntity(types.Case, query)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('REQUEST', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.request(types.Case, requestId)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })

    it('CACHE_HIT', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.cacheHit(types.Case, query, sampleData.Case.response.result)
      )

      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.equal(sampleData.Case.response.result)

    })

    it('SUCCESS', () => {
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.success(types.Case, requestId, sampleData.Case.response.result, sampleData.Case.response.entities)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.equal(sampleData.Case.response.result)
    })

    it('FAILURE', () => {
      const error = 'the error message'
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        actions.failure(types.Case, requestId, error)
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', false)
      expect(newState[requestId]).to.have.property('rejected', true)
      expect(newState[requestId]).to.have.property('reason', error)
    })
  })

  describe('entityReducer', () => {
    const entityReducerForEntity = createEntitiesReducer(apiTypes, types.Case)

    it('SUCCESS with entities', () => {
      const newState = entityReducerForEntity(
        createCleanState(query).cache.entities[collection],
        actions.success(types.Case, requestId, sampleData.Case.response.result, sampleData.Case.response.entities),
      )

      expect(newState).to.deep.equal(sampleData.Case.response.entities[collection])
    })

    it('should not remove fields when merging partial JSON response', () => {
      // first request return full JSON
      const state = entityReducerForEntity(
        createCleanState(query).cache.entities[collection],
        actions.success(
          types.Case, requestId, 
          sampleData.Case.response.result, 
          sampleData.Case.response.entities
        ),
      )

      // new request which does not return the activities
      const { activities, ...partialCase } = sampleData.Case.response.entities.case['0IWE1379946_2703_2014']
      expect(activities).to.exist

      const nextState = entityReducerForEntity(
        state,
        actions.success(
          types.Case, requestId, 
          sampleData.Case.response.result, 
          { '0IWE1379946_2703_2014': partialCase }
        ),
      )

      expect(nextState['0IWE1379946_2703_2014'].activities).to.equal(activities)
    })
  })
  
}
