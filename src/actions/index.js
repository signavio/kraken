import invariant from 'invariant'
import { mapValues } from 'lodash'

import {
  ApiTypeMap,
  Payload,
  Action,

  CreateDispatchPayload,
  CreateDispatchAction,
  CreateSuccessPayload,
  CreateSuccessAction,
  CreateFailurePayload,
  CreateFailureAction,

  UpdateDispatchPayload,
  UpdateDispatchAction,
  UpdateSuccessPayload,
  UpdateSuccessAction,
  UpdateFailurePayload,
  UpdateFailureAction,

  FetchDispatchPayload,
  FetchDispatchAction,
  FetchSuccessPayload,
  FetchSuccessAction,
  FetchFailurePayload,
  FetchFailureAction,

  RemoveDispatchPayload,
  RemoveDispatchAction,
  RemoveSuccessPayload,
  RemoveSuccessAction,
  RemoveFailurePayload,
  RemoveFailureAction,
} from '../internalTypes'

type ActionCreator = (Payload) => Action
type ActionCreatorMap = {
  dispatchCreate(payload: CreateDispatchPayload): CreateDispatchAction,
  dispatchUpdate(payload: UpdateDispatchPayload): UpdateDispatchAction,
  dispatchFetch (payload: FetchDispatchPayload):  FetchDispatchAction,
  dispatchRemove(payload: RemoveDispatchPayload): RemoveDispatchAction,

  succeedCreate(payload: CreateSuccessPayload): CreateSuccessAction,
  succeedUpdate(payload: UpdateSuccessPayload): UpdateSuccessAction,
  succeedFetch (payload: FetchSuccessPayload):  FetchSuccessAction,
  succeedRemove(payload: RemoveSuccessPayload): RemoveSuccessAction,

  failCreate(payload: CreateFailurePayload): CreateFailureAction,
  failUpdate(payload: UpdateFailurePayload): UpdateFailureAction,
  failFetch (payload: FetchFailurePayload):  FetchFailureAction,
  failRemove(payload: RemoveFailurePayload): RemoveFailureAction,
}

const actionCreatorMap: ActionCreatorMap = {
  dispatchCreate(payload: CreateDispatchPayload): CreateDispatchAction {
    return {
      type: 'CREATE_DISPATCH',
      payload,
    }
  },

  dispatchUpdate(payload: UpdateDispatchPayload): UpdateDispatchAction {
    return {
      type: 'UPDATE_DISPATCH',
      payload,
    }
  },

  dispatchFetch (payload: FetchDispatchPayload):  FetchDispatchAction {
    return {
      type: 'FETCH_DISPATCH',
      payload,
    }
  },

  dispatchRemove(payload: RemoveDispatchPayload): RemoveDispatchAction {
    return {
      type: 'REMOVE_DISPATCH',
      payload,
    }
  },


  succeedCreate(payload: CreateSuccessPayload): CreateSuccessAction {
    return {
      type: 'CREATE_SUCCESS',
      payload,
    }
  },

  succeedUpdate(payload: UpdateSuccessPayload): UpdateSuccessAction {
    return {
      type: 'UPDATE_SUCCESS',
      payload,
    }
  },

  succeedFetch (payload: FetchSuccessPayload):  FetchSuccessAction {
    return {
      type: 'FETCH_SUCCESS',
      payload,
    }
  },

  succeedRemove(payload: RemoveSuccessPayload): RemoveSuccessAction {
    return {
      type: 'REMOVE_SUCCESS',
      payload,
    }
  },


  failCreate(payload: CreateFailurePayload): CreateFailureAction {
    return {
      type: 'CREATE_FAILURE',
      payload,
    }
  },

  failUpdate(payload: UpdateFailurePayload): UpdateFailureAction {
    return {
      type: 'UPDATE_FAILURE',
      payload,
    }
  },

  failFetch (payload: FetchFailurePayload):  FetchFailureAction {
    return {
      type: 'FETCH_FAILURE',
      payload,
    }
  },

  failRemove(payload: RemoveFailurePayload): RemoveFailureAction {
    return {
      type: 'REMOVE_FAILURE',
      payload,
    }
  },
}


const enhanceWithEntityTypeValidation
  = (types: ApiTypeMap, actionCreator: ActionCreator, actionCreatorName: string) =>
  (payload: Payload) => {
    invariant(
      !!types[payload.entityType],
      `Payload of ${actionCreatorName} action creator must contain \`entityType\` of one of the following constants:
      \`${Object.keys(types).join(', ')}\`
      (is: \`${payload.entityType}\`)`
    )

    return actionCreator(payload)
  }


const createActionCreators = (types: ApiTypeMap) => mapValues/*<ActionCreatorMap>*/(
  actionCreatorMap,
  enhanceWithEntityTypeValidation.bind(null, types)
)

export default createActionCreators
