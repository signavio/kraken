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

  RequestStartAction,
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

export const actionTypes = {
  CREATE_DISPATCH: 'GENERIC_API_CREATE_DISPATCH',
  UPDATE_DISPATCH: 'GENERIC_API_UPDATE_DISPATCH',
  FETCH_DISPATCH: 'GENERIC_API_FETCH_DISPATCH',
  REMOVE_DISPATCH: 'GENERIC_API_REMOVE_DISPATCH',
  CREATE_SUCCESS: 'GENERIC_API_CREATE_SUCCESS',
  UPDATE_SUCCESS: 'GENERIC_API_UPDATE_SUCCESS',
  FETCH_SUCCESS: 'GENERIC_API_FETCH_SUCCESS',
  REMOVE_SUCCESS: 'GENERIC_API_REMOVE_SUCCESS',
  CREATE_FAILURE: 'GENERIC_API_CREATE_FAILURE',
  UPDATE_FAILURE: 'GENERIC_API_UPDATE_FAILURE',
  FETCH_FAILURE: 'GENERIC_API_FETCH_FAILURE',
  REMOVE_FAILURE: 'GENERIC_API_REMOVE_FAILURE',
  REQUEST_START: 'GENERIC_API_REQUEST_START',
  WIPE_CACHE: 'GENERIC_API_WIPE_CACHE',
}

const actionCreatorMap: ActionCreatorMap = {
  dispatchCreate(payload: CreateDispatchPayload): CreateDispatchAction {
    return {
      type: actionTypes.CREATE_DISPATCH,
      payload,
    }
  },

  dispatchUpdate(payload: UpdateDispatchPayload): UpdateDispatchAction {
    return {
      type: actionTypes.UPDATE_DISPATCH,
      payload,
    }
  },

  dispatchFetch (payload: FetchDispatchPayload): FetchDispatchAction {
    return {
      type: actionTypes.FETCH_DISPATCH,
      payload,
    }
  },

  dispatchRemove(payload: RemoveDispatchPayload): RemoveDispatchAction {
    return {
      type: actionTypes.REMOVE_DISPATCH,
      payload,
    }
  },


  succeedCreate(payload: CreateSuccessPayload): CreateSuccessAction {
    return {
      type: actionTypes.CREATE_SUCCESS,
      payload,
    }
  },

  succeedUpdate(payload: UpdateSuccessPayload): UpdateSuccessAction {
    return {
      type: actionTypes.UPDATE_SUCCESS,
      payload,
    }
  },

  succeedFetch (payload: FetchSuccessPayload):  FetchSuccessAction {
    return {
      type: actionTypes.FETCH_SUCCESS,
      payload,
    }
  },

  succeedRemove(payload: RemoveSuccessPayload): RemoveSuccessAction {
    return {
      type: actionTypes.REMOVE_SUCCESS,
      payload,
    }
  },


  failCreate(payload: CreateFailurePayload): CreateFailureAction {
    return {
      type: actionTypes.CREATE_FAILURE,
      payload,
    }
  },

  failUpdate(payload: UpdateFailurePayload): UpdateFailureAction {
    return {
      type: actionTypes.UPDATE_FAILURE,
      payload,
    }
  },

  failFetch (payload: FetchFailurePayload):  FetchFailureAction {
    return {
      type: actionTypes.FETCH_FAILURE,
      payload,
    }
  },

  failRemove(payload: RemoveFailurePayload): RemoveFailureAction {
    return {
      type: actionTypes.REMOVE_FAILURE,
      payload,
    }
  },

  startRequest(payload: RequestStartPayload): RequestStartAction {
    return {
      type: actionTypes.REQUEST_START,
      payload,
    }
  },
}

// Non entityType specific action creator
const wipe = () => ({
  type: actionTypes.WIPE_CACHE,
})


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


const createActionCreators = (types: ApiTypeMap) => ({
  ...mapValues/*<ActionCreatorMap>*/(
    actionCreatorMap,
    enhanceWithEntityTypeValidation.bind(null, types)
  ),
  wipe,
})

export default createActionCreators
