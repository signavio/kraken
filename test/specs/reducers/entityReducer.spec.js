import { normalize } from 'normalizr'

import expect from '../../expect'

import createActionCreators, {
  SUCCESS,
  REMOVE_ENTITY,
} from '../../../src/actions'

import { typeUtils } from '../../../src'
import { deriveRequestId } from '../../../src/utils'

import { createEntitiesReducer } from '../../../src/reducers'

import { apiTypes, types, data } from '../fixtures'

const actions = createActionCreators(apiTypes)

const id = 'my-id'
const requestId = deriveRequestId('fetch', { query: { id } })
const collection = typeUtils.getCollection(apiTypes, types.USER)
const entityReducerForEntity = createEntitiesReducer(apiTypes, types.USER)

const { result, entities } = normalize(data.user, apiTypes.USER.schema)

describe('entityReducer', () => {
  describe(SUCCESS, () => {
    it('should add all entities to the current state.', () => {
      const newState = entityReducerForEntity(
        {},
        actions.success(
          types.USER, requestId,

          result,
          entities,
        ),
      )

      expect(newState).to.deep.equal(entities[collection])
    })

    it('should not remove fields when merging partial JSON response', () => {
      // first request return full JSON
      const state = entityReducerForEntity(
        {},
        actions.success(
          types.USER, requestId,

          result,
          entities
        ),
      )

      // new request which does not return the activities
      const { firstName, ...partialUser } = entities.users['user-1']
      expect(firstName).to.exist

      const nextState = entityReducerForEntity(
        state,

        actions.success(
          types.USER, requestId,
          result,
          { 'user-1': partialUser }
        ),
      )

      expect(nextState['user-1'].firstName).to.equal(firstName)
    })
  })

  describe(REMOVE_ENTITY, () => {
    it('should remove entities from the state when a remove action is fired', () => {
      const state = entityReducerForEntity(
        {
          [id]: { id },
          'someotherid': {},
        },

        actions.removeEntity(
          types.USER, { id },
        ),
      )

      expect(state).to.not.have.key(id)
      expect(state).to.have.key('someotherid')
    })

    it('should select the entity to remove by comparing query params with entity attributes', () => {
      const state = entityReducerForEntity(
        { [id]: { foo: 'bar', baz: 1, boo: true } },

        actions.removeEntity(
          types.USER, { foo: 'bar', baz: 1 },
        ),
      )

      expect(state).to.not.have.key(id)
    })
  })
})
