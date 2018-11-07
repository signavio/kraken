import { startsWith } from 'lodash'

import { getCachePolicy } from '../types'

import type { ApiTypeMap, Action, State } from '../internalTypes'

const createEntitiesSideEffectsReducer = (
  apiTypes: ApiTypeMap,
  typeConstant
) => {
  const { updateEntitiesOnAction } = getCachePolicy(apiTypes, typeConstant)

  return (state: State = {}, action: Action) => {
    if (!startsWith(action.type, '@@kraken/')) {
      return state
    }

    if (!updateEntitiesOnAction) {
      return state
    }

    return updateEntitiesOnAction(apiTypes, state, action)
  }
}

export default createEntitiesSideEffectsReducer
