// @flow
import { actionTypes } from '../actions'
import { type Action, type RequestMethod } from '../flowTypes'

const getMethodName = (action: Action): RequestMethod => {
  switch (action.type) {
    case actionTypes.FETCH_DISPATCH:
    case actionTypes.FETCH_SUCCESS:
    case actionTypes.FETCH_FAILURE:
      return 'fetch'
    case actionTypes.CREATE_DISPATCH:
    case actionTypes.CREATE_SUCCESS:
    case actionTypes.CREATE_FAILURE:
      return 'create'
    case actionTypes.UPDATE_DISPATCH:
    case actionTypes.UPDATE_SUCCESS:
    case actionTypes.UPDATE_FAILURE:
      return 'update'
    case actionTypes.REMOVE_DISPATCH:
    case actionTypes.REMOVE_SUCCESS:
    case actionTypes.REMOVE_FAILURE:
      return 'remove'

    default:
      throw new Error(`Unkown action type ${action.type}`)
  }
}

export default getMethodName
