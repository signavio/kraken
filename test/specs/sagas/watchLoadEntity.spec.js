import {
  put,
  call,
} from 'redux-saga/effects'

import expect from '../../expect'

import { createFetchEntity } from '../../../src/sagas/watchLoadEntity'

import actionsCreator from '../../../src/actions'

import { getPromiseState } from '../../../src/utils'
import { typeUtils } from '../../../src'

import * as sampleData from '../../data'

import { apiTypes } from '../../types'

const fetchEntity = createFetchEntity(apiTypes)
const actions = actionsCreator(apiTypes)

export default () => {
  Object.keys(apiTypes).forEach((type) => {
    describe(type, () => {
      genericTest(
        type,
        sampleData[type],
      )
    })
  })
}

const genericTest = (type, data) => {

  describe('loadEntity', () => {
    it('should call `fetchEntity` the entity is not already cached')
    it('should dispatch a `cacheHit` action if the entity is already in the cache')
  })

  describe('fetchEntity', () => {

    describe('happy path', () => {
      const query = { id: 'p1' }
      const state = {
        cache: {
          promises: {
            ...Object.keys(apiTypes).reduce((pre, key) => ({
              ...pre,
              [key]: {
                [typeUtils.stringifyQuery(query)]: {
                  outstanding: true,
                },
              },
            }), {}),
          },
        },
      }
      const getPromise = (entity, promiseQuery) => {
        return getPromiseState(state, entity, promiseQuery, apiTypes)
      }

      const gen = fetchEntity(type, query, getPromise)

      it('should dispatch a `request` action', () => {
        const genNext = gen.next()
        expect(genNext.value)
          .to.deep.equal( put(actions.fetch(type, query)) )
      })

      it('should call the `fetch` function of the entity type passing in the query object', () => {
        const genNext = gen.next()
        expect(genNext.value)
          .to.deep.equal( call(typeUtils.getFetch(apiTypes, type), query) )
      })

      it('should dispatch the `success` action with the server response data', () => {
        const { response } = data
        const genNext = gen.next(data)
        expect(genNext.value)
          .to.deep.equal( put(actions.success(type, query, response.result, response.entities)) )
      })
    })

    describe('server failure', () => {
      const query = { id: 'p3' }
      const state = {
        cache: {
          promises: {
            ...Object.keys(apiTypes).reduce((pre, key) => ({
              ...pre,
              [key]: {
                [typeUtils.stringifyQuery(query)]: {
                  outstanding: true,
                },
              },
            }), {}),
          },
        },
      }
      const getPromise = (entity, promiseQuery) => {
        return getPromiseState(state, entity, promiseQuery, apiTypes)
      }

      const gen = fetchEntity(type, query, getPromise)
      gen.next() // dispatch `request` action
      gen.next() // call `fetch` function

      it('should dispatch an `error` action if the server request fails', () => {

        const error = 'Some error message'
        const genNext = gen.next({ error }) // simulate server error
        expect(genNext.value)
          .to.deep.equal( put(actions.failure(type, query, error)) )
      })
    })

  })
  
}
