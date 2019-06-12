import { startsWith } from 'lodash'

import { getCachePolicy } from '../cachePolicies'
import type { Action, ApiTypeMap, State } from '../flowTypes'

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
