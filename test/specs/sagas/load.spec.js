import {
  put,
  call,
} from 'redux-saga/effects'

import expect from '../../expect'

import { createFetchEntity } from '../../../src/middleware/sagas'

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

  describe('success', () => {
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

    it('should put request', () => {
      const genNext = gen.next()
      expect(genNext.value)
      .to.deep.equal( put(actions.request(type, query)) )
    })

    it('should call fetch', () => {
      const genNext = gen.next()
      expect(genNext.value)
      .to.deep.equal( call(typeUtils.getFetch(apiTypes, type), query) )
    })

    it('should put success action', () => {
      const { response } = data
      const genNext = gen.next(data)
      expect(genNext.value)
      .to.deep.equal( put(actions.success(type, query, response.result, response.entities)) )
    })
  })

  describe('failure', () => {
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

    it('should put request', () => {
      const genNext = gen.next()
      expect(genNext.value)
      .to.deep.equal( put(actions.request(type, query)) )
    })

    it('should call fetch', () => {
      const genNext = gen.next()
      expect(genNext.value)
      .to.deep.equal( call(typeUtils.getFetch(apiTypes, type), query) )
    })

    it('should put error', () => {
      const error = 'Some error message'
      const genNext = gen.next({ error })
      expect(genNext.value)
      .to.deep.equal( put(actions.failure(type, query, error)) )
    })
  })
}
