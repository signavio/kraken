import expect from '../../expect'

import createActionCreators, {
  LOAD_ENTITY,
  SUCCESS,
  FAILURE,
  REQUEST,
  CACHE_HIT,
} from '../../../src/actions'
import { typeUtils } from '../../../src'
import {
  createEntitiesReducer,
  createPromisesReducer,
} from '../../../src/reducers'

const testId = 'testSubjectId'

import * as sampleData from '../../data'

import types from '../../types'

export default () => {
  Object.keys(types).forEach((type) => {
    describe(type, () => {
      dataTest(
        { ...types[type], key: type },
        type,
        sampleData[type],
      )
    })
  })
}

const createCleanState = (query) => ({
  cache: {
    promises: {
      ...Object.keys(types).reduce((prev, key) => ({
        ...prev,
        [key]: {
          [typeUtils.stringifyQuery(query)]: {},
        },
      }), {}),
    },
    entities: {
      ...Object.keys(types).reduce((prev, key) => ({
        ...prev,
        [typeUtils.getCollection(types, key)]: {},
      }), {}),
    },
  },
})
const dataTest = (entity, type, value) => {

  const query = { id: testId }
  const typeKey = typeUtils.stringifyQuery(query)
  const collection = typeUtils.getCollection(types, type)
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
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', true)
      expect(newState[typeKey]).to.have.property('pending', true)
    })

    it('REQUEST', () => {
      const loadAction = {
        type: REQUEST,
        payload: {
          entity,
          query,
        },
      }
      const newState = promiseReducerForEntity(
        createCleanState(query).cache.promises[typeKey],
        loadAction,
      )
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', false)
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
        createCleanState(query).cache.promises[typeKey],
        loadAction,
      )
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', false)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', true)
      expect(newState[typeKey]).to.have.property('rejected', false)
      expect(newState[typeKey]).to.have.property('value').to.deep.equal(value)

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
        createCleanState(query).cache.promises[typeKey],
        loadAction,
      )
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', true)
      expect(newState[typeKey]).to.have.property('rejected', false)
      expect(newState[typeKey]).to.have.property('value').to.deep.equal(value)
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
        createCleanState(query).cache.promises[typeKey],
        loadAction,
      )
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', false)
      expect(newState[typeKey]).to.have.property('rejected', true)
      expect(newState[typeKey]).to.have.property('reason', error)
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
