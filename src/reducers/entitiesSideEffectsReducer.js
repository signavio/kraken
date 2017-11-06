import { mapValues, omitBy, isUndefined } from 'lodash'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import { ApiTypeMap, EntitiesState, Action } from '../internalTypes'

import { deriveEntityIdFromAction } from '../utils'
import { getCollectionName, getCachePolicy } from '../types'
import { actionTypes } from '../actions'

const entitiesSideEffectsReducer = (
  state: EntitiesState,
  action: Action,
  updateEntityOnAction
) => {
  const newState = omitBy(
    mapValues(state, entity => updateEntityOnAction(entity, action)),
    isUndefined
  )

  return shallowEqual(state, newState) ? state : newState
}

const createEntitiesSideEffectsReducer = (
  apiTypes: ApiTypeMap,
  typeConstant
) => {
  const { updateEntityOnAction } = getCachePolicy(apiTypes, typeConstant)

  return (state: State = {}, action: Action) => {
    if (!updateEntityOnAction) {
      return state
    }

    return entitiesSideEffectsReducer(
      state,
      action,
      updateEntityOnAction.bind(null, typeConstant)
    )
  }
}

export default createEntitiesSideEffectsReducer
