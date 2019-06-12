import invariant from 'invariant'
import { mapValues } from 'lodash'

import {
  ApiTypeMap,
  Payload,
  Action,
  DispatchPayload,
  CreateDispatchAction,
  CreateSuccessPayload,
  CreateSuccessAction,
  CreateFailurePayload,
  CreateFailureAction,
  UpdateDispatchAction,
  UpdateSuccessPayload,
  UpdateSuccessAction,
  UpdateFailurePayload,
  UpdateFailureAction,
  FetchDispatchAction,
  FetchSuccessPayload,
  FetchSuccessAction,
  FetchFailurePayload,
  FetchFailureAction,
  RemoveDispatchAction,
  RemoveSuccessPayload,
  RemoveSuccessAction,
  RemoveFailurePayload,
  RemoveFailureAction,
  RequestStartAction,
  RequestStartPayload,
} from '../flowTypes'

type ActionCreator = (payload: Payload) => Action
type ActionCreatorMap = {
  dispatchCreate: (payload: DispatchPayload) => CreateDispatchAction,
  dispatchUpdate: (payload: DispatchPayload) => UpdateDispatchAction,
  dispatchFetch: (payload: DispatchPayload) => FetchDispatchAction,
  dispatchRemove: (payload: DispatchPayload) => RemoveDispatchAction,

  succeedCreate: (payload: CreateSuccessPayload) => CreateSuccessAction,
  succeedUpdate: (payload: UpdateSuccessPayload) => UpdateSuccessAction,
  succeedFetch: (payload: FetchSuccessPayload) => FetchSuccessAction,
  succeedRemove: (payload: RemoveSuccessPayload) => RemoveSuccessAction,

  failCreate: (payload: CreateFailurePayload) => CreateFailureAction,
  failUpdate: (payload: UpdateFailurePayload) => UpdateFailureAction,
  failFetch: (payload: FetchFailurePayload) => FetchFailureAction,
  failRemove: (payload: RemoveFailurePayload) => RemoveFailureAction,
}

export const actionTypes = {
  CREATE_DISPATCH: '@@kraken/CREATE_DISPATCH',
  UPDATE_DISPATCH: '@@kraken/UPDATE_DISPATCH',
  FETCH_DISPATCH: '@@kraken/FETCH_DISPATCH',
  REMOVE_DISPATCH: '@@kraken/REMOVE_DISPATCH',
  CREATE_SUCCESS: '@@kraken/CREATE_SUCCESS',
  UPDATE_SUCCESS: '@@kraken/UPDATE_SUCCESS',
  FETCH_SUCCESS: '@@kraken/FETCH_SUCCESS',
  REMOVE_SUCCESS: '@@kraken/REMOVE_SUCCESS',
  CREATE_FAILURE: '@@kraken/CREATE_FAILURE',
  UPDATE_FAILURE: '@@kraken/UPDATE_FAILURE',
  FETCH_FAILURE: '@@kraken/FETCH_FAILURE',
  REMOVE_FAILURE: '@@kraken/REMOVE_FAILURE',
  REQUEST_START: '@@kraken/REQUEST_START',
  WIPE_CACHE: '@@kraken/WIPE_CACHE',
}

const actionCreatorMap: ActionCreatorMap = {
  dispatchCreate(payload: DispatchPayload): CreateDispatchAction {
    return {
      type: actionTypes.CREATE_DISPATCH,
      payload,
    }
  },

  dispatchUpdate(payload: DispatchPayload): UpdateDispatchAction {
    return {
      type: actionTypes.UPDATE_DISPATCH,
      payload,
    }
  },

  dispatchFetch(payload: DispatchPayload): FetchDispatchAction {
    return {
      type: actionTypes.FETCH_DISPATCH,
      payload,
    }
  },

  dispatchRemove(payload: DispatchPayload): RemoveDispatchAction {
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

  succeedFetch(payload: FetchSuccessPayload): FetchSuccessAction {
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

  failFetch(payload: FetchFailurePayload): FetchFailureAction {
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

const enhanceWithEntityTypeValidation = (
  types: ApiTypeMap,
  actionCreator: ActionCreator,
  actionCreatorName: string
) => (payload: Payload) => {
  invariant(
    !!types[payload.entityType],
    `Payload of ${actionCreatorName} action creator must contain \`entityType\` of one of the following constants:
      \`${Object.keys(types).join(', ')}\`
      (is: \`${payload.entityType}\`)`
  )

  return actionCreator(payload)
}

const createActionCreators = (types: ApiTypeMap) => ({
  ...mapValues(
    /*<ActionCreatorMap>*/ actionCreatorMap,
    enhanceWithEntityTypeValidation.bind(null, types)
  ),
  wipe,
})

export default createActionCreators
