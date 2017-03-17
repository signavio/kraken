import expect from '../../expect'

import createActionCreators from '../../../src/actions'
import { createWipeReducer } from '../../../src/reducers'

import { apiTypes } from '../fixtures'

const actions = createActionCreators(apiTypes)

const wipeReducer = createWipeReducer

describe('wipeReducer', () => {
  describe('WIPE_CACHE', () => {
    it('should wipe cache', () => {
      const state = {
        entities: {},
        requests: {},
      }

      const nextState = wipeReducer(
        state,

        actions.wipe()
      )

      expect(nextState).to.deep.equal({})
    })
  })
})
