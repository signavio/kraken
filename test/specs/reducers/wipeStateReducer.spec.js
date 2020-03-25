import createActionCreators from '../../../src/actions'
import { wipeReducer } from '../../../src/reducers'
import expect from '../../expect'
import { apiTypes } from '../fixtures'

const actions = createActionCreators(apiTypes)

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
