import expect from '../../expect'

import createActionCreators, {
  SUCCESS,
  REMOVE_ENTITY,
} from '../../../src/actions'

import { typeUtils } from '../../../src'
import { deriveRequestId } from '../../../src/utils'

import { createEntitiesReducer } from '../../../src/reducers'

import * as data from '../../data'

import types, { apiTypes } from '../../types'

const actions = createActionCreators(apiTypes)
const sampleData = data.Case.response

const id = 'my-id'
const requestId = deriveRequestId('fetch', { query: { id } })
const collection = typeUtils.getCollection(apiTypes, types.Case)
const entityReducerForEntity = createEntitiesReducer(apiTypes, types.Case)

describe('entityReducer', () => {
  describe(SUCCESS, () => {
    it('should add all entities to the current state.', () => {
      const newState = entityReducerForEntity(
        {},
        actions.success(
          types.Case, requestId,

          sampleData.result,
          sampleData.entities,
        ),
      )

      expect(newState).to.deep.equal(sampleData.entities[collection])
    })

    it('should not remove fields when merging partial JSON response', () => {
      // first request return full JSON
      const state = entityReducerForEntity(
        {},
        actions.success(
          types.Case, requestId,

          sampleData.result,
          sampleData.entities
        ),
      )

      // new request which does not return the activities
      const { activities, ...partialCase } = sampleData.entities.case['0IWE1379946_2703_2014']
      expect(activities).to.exist

      const nextState = entityReducerForEntity(
        state,

        actions.success(
          types.Case, requestId,
          sampleData.result,
          { '0IWE1379946_2703_2014': partialCase }
        ),
      )

      expect(nextState['0IWE1379946_2703_2014'].activities).to.equal(activities)
    })
  })

  describe(REMOVE_ENTITY, () => {
    it('should remove entities from the state when a remove action is fired', () => {
      const state = entityReducerForEntity(
        { [id]: { id } },

        actions.removeEntity(
          types.Case, { id },
        ),
      )

      expect(state).to.not.have.key(id)
    })

    it('should select the entity to remove by comparing query params with entity attributes', () => {
      const state = entityReducerForEntity(
        { [id]: { foo: 'bar', baz: 1, boo: true } },

        actions.removeEntity(
          types.Case, { foo: 'bar', baz: 1 },
        ),
      )

      expect(state).to.not.have.key(id)
    })
  })
})
