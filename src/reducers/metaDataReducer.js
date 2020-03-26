// @flow
import { ADD_META_DATA } from '../actions'
import { type Action, type MetaData } from '../flowTypes'

function metaReducer(
  state: MetaData = Object.freeze({ credentials: 'same-origin' }),
  action: Action
): MetaData {
  switch (action.type) {
    case ADD_META_DATA: {
      const { headers, credentials } = action.payload

      return {
        headers,
        credentials,
      }
    }

    default: {
      return state
    }
  }
}

export default metaReducer
