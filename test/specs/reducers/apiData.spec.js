import expect from '../../expect'

import {
  LOAD_ENTITY,
  SUCCESS,
  FAILURE,
  REQUEST,
  CACHE_HIT,
} from '../../../src/actions'

import { typeUtils } from '../../../src'
import { stringifyQuery } from '../../../src/utils'

import {
  createEntitiesReducer,
  createPromisesReducer,
} from '../../../src/reducers'

const testId = 'testSubjectId'

import * as sampleData from '../../data'

import { apiTypes } from '../../types'

export default () => {
  Object.keys(apiTypes).forEach((type) => {
    describe(type, () => {
      dataTest(
        { ...apiTypes[type], key: type },
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
          [stringifyQuery(query)]: {},
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
const dataTest = (entity, type, value) => {

  const query = { id: testId }
  const requestId = stringifyQuery(query)
  const collection = typeUtils.getCollection(apiTypes, type)
  // const entityReducerForEntity = entityReducer(entity)
  describe('promiseReducer', () => {
    const promiseReducerForEntity = createPromisesReducer(entity)

    it('LOAD_ENTITY', () => {
      const loadAction = {
        type: LOAD_ENTITY,
        payload: {
          entity,
          query,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[entity],
        loadAction,
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', true)
      expect(newState[requestId]).to.have.property('pending', true)
    })

    it('REQUEST', () => {
      const loadAction = {
        type: REQUEST,
        payload: {
          entity,
          requestId,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        loadAction,
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
    })

    it('CACHE_HIT', () => {
      const loadAction = {
        type: CACHE_HIT,
        payload: {
          entity,
          query,
          value,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        loadAction,
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('outstanding', false)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.deep.equal(value)

    })

    it('SUCCESS', () => {
      const loadAction = {
        type: SUCCESS,
        payload: {
          entity,
          query,
          value,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        loadAction,
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', true)
      expect(newState[requestId]).to.have.property('rejected', false)
      expect(newState[requestId]).to.have.property('value').to.deep.equal(value)
    })

    it('FAILURE', () => {
      const error = 'the error message'
      const loadAction = {
        type: FAILURE,
        payload: {
          entity,
          query,
          error,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[requestId],
        loadAction,
      )
      expect(newState).to.have.property(requestId)
      expect(newState[requestId]).to.have.property('pending', false)
      expect(newState[requestId]).to.have.property('fulfilled', false)
      expect(newState[requestId]).to.have.property('rejected', true)
      expect(newState[requestId]).to.have.property('reason', error)
    })

  })

  describe('entityReducer', () => {
    const entityReducerForEntity = createEntitiesReducer(entity)

    it('SUCCESS with entities', () => {
      const loadAction = {
        type: SUCCESS,
        payload: {
          entity: type,
          entities: value.response.entities,
        },
      }

      const newState = entityReducerForEntity(
        createCleanState(query).cache.entities[collection],
        loadAction,
      )

      expect(newState).to.deep.equal(value.response.entities[collection])
    })

  })
}
