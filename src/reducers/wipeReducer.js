import { actionTypes } from '../actions'

const wipeReducer = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.WIPE_CACHE:
      return { }
    default:
      return state
  }
}

export default wipeReducer
