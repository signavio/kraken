// @flow
import { ADD_META_DATA } from '../actions'
import { type Action, type MetaData } from '../flowTypes'

function metaReducer(
  state: MetaData = Object.freeze({}),
  action: Action
): MetaData {
  switch (action.type) {
    case ADD_META_DATA: {
      const { headers } = action.payload

      return {
        headers,
      }
    }

    default: {
      return state
    }
  }
}

export default metaReducer
