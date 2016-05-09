import expect from '../../expect'

import actionsCreator from '../../../src/actions'
import { typeUtils } from '../../../src'
import createRootReducer,
{
  createEntitiesReducer,
  createPromisesReducer,
} from '../../../src/reducers'

const testId = 'testSubjectId'

import * as sampleData from '../../data'

import types from '../../types'

const actions = actionsCreator(types)
const reducer = createRootReducer(types)
const entityReducer = createEntitiesReducer(types)
const promiseReducer = createPromisesReducer(types)

export default () => {
  Object.keys(types).forEach((type) => {
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
      ...Object.keys(types).reduce((prev, key) => ({
        ...prev,
        [typeUtils.getCollection(types, key)]: {
          [typeUtils.getPromiseMapper(types, key)(query)]: {},
        },
      }), {}),
    },
  },
})
const dataTest = (entity, value) => {

  // const entityReducerForEntity = entityReducer(entity)
  describe('promiseReducer', () => {
    const promiseReducerForEntity = promiseReducer(entity)
    const query = { id: testId }
    const typeKey = typeUtils.getPromiseMapper(types, entity)(query)

    it('LOAD_ENTITY', () => {
      const loadAction = {
        type: actions.LOAD_ENTITY,
        payload: {
          entity,
          query,
        },
      }
      const newState = promiseReducerForEntity(createCleanState(query), loadAction)
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', true)
      expect(newState[typeKey]).to.have.property('pending', true)
    })

    it('REQUEST', () => {
      const loadAction = {
        type: actions.REQUEST,
        payload: {
          entity,
          query,
        },
      }
      const newState = promiseReducerForEntity(createCleanState(query), loadAction)
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', false)
    })

    it('CACHE_HIT', () => {
      const loadAction = {
        type: actions.CACHE_HIT,
        payload: {
          entity,
          query,
          value,
        },
      }
      const newState = promiseReducerForEntity(createCleanState(query), loadAction)
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('outstanding', false)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', true)
      expect(newState[typeKey]).to.have.property('rejected', false)
      expect(newState[typeKey]).to.have.property('value').to.deep.equal(value)

    })

    it('SUCCESS', () => {
      const loadAction = {
        type: actions.SUCCESS,
        payload: {
          entity,
          query,
          value,
        },
      }
      const newState = promiseReducerForEntity(createCleanState(query), loadAction)
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', true)
      expect(newState[typeKey]).to.have.property('rejected', false)
      expect(newState[typeKey]).to.have.property('value').to.deep.equal(value)
    })

    it('FAILURE', () => {
      const error = 'the error message'
      const loadAction = {
        type: actions.FAILURE,
        payload: {
          entity,
          query,
          error,
        },
      }
      const newState = promiseReducerForEntity(createCleanState(query), loadAction)
      expect(newState).to.have.property(typeKey)
      expect(newState[typeKey]).to.have.property('pending', false)
      expect(newState[typeKey]).to.have.property('fulfilled', false)
      expect(newState[typeKey]).to.have.property('rejected', true)
      expect(newState[typeKey]).to.have.property('reason', error)
    })

  })


  //
  // it('should return success state', () => {
  //   const loadAction = {
  //     type: actions.SUCCESS,
  //     payload: {
  //       entity,
  //       subjectId: testId,
  //       value: data,
  //     },
  //   }
  //
  //   const newState = entityReducer({}, loadAction)
  //   expect(newState).to.have.property(testId)
  //   expect(newState[testId]).to.have.property('entity', entity)
  //   expect(newState[testId]).to.have.property('value', data)
  // })
  // //
  // it('should return error state', () => {
  //   const error = 'something went wrong'
  //   const loadAction = {
  //     type: actions.FAILURE,
  //     payload: {
  //       entity,
  //       error,
  //       subjectId: testId,
  //     },
  //     error: true,
  //   }
  //
  //   const newState = entityReducer({}, loadAction)
  //   expect(newState).to.have.property(testId)
  //   expect(newState[testId]).to.have.property('entity', entity)
  //   expect(newState[testId]).to.have.property('error', error)
  //
  // })
}
