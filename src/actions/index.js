import invariant from 'invariant'
import { mapValues } from 'lodash'

import {
  Action,
  ApiTypeMap,
  CreateDispatchAction,
  CreateFailureAction,
  CreateFailurePayload,
  CreateSuccessAction,
  CreateSuccessPayload,
  DispatchPayload,
  FetchDispatchAction,
  FetchFailureAction,
  FetchFailurePayload,
  FetchSuccessAction,
  FetchSuccessPayload,
  Payload,
  RemoveDispatchAction,
  RemoveFailureAction,
  RemoveFailurePayload,
  RemoveSuccessAction,
  RemoveSuccessPayload,
  RequestStartAction,
  RequestStartPayload,
  UpdateDispatchAction,
  UpdateFailureAction,
  UpdateFailurePayload,
  UpdateSuccessAction,
  UpdateSuccessPayload,
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

const CREATE_DISPATCH = '@@kraken/CREATE_DISPATCH'

const dispatchCreate = (payload: DispatchPayload): CreateDispatchAction => ({
  type: actionTypes.CREATE_DISPATCH,
  payload,
})

const UPDATE_DISPATCH = '@@kraken/UPDATE_DISPATCH'

const dispatchUpdate = (payload: DispatchPayload): UpdateDispatchAction => ({
  type: actionTypes.UPDATE_DISPATCH,
  payload,
})

const FETCH_DISPATCH = '@@kraken/FETCH_DISPATCH'

const dispatchFetch = (payload: DispatchPayload): FetchDispatchAction => ({
  type: actionTypes.FETCH_DISPATCH,
  payload,
})

const REMOVE_DISPATCH = '@@kraken/REMOVE_DISPATCH'

const dispatchRemove = (payload: DispatchPayload): RemoveDispatchAction => ({
  type: actionTypes.REMOVE_DISPATCH,
  payload,
})

const CREATE_SUCCESS = '@@kraken/CREATE_SUCCESS'

const succeedCreate = (payload: CreateSuccessPayload): CreateSuccessAction => ({
  type: actionTypes.CREATE_SUCCESS,
  payload,
})

const UPDATE_SUCCESS = '@@kraken/UPDATE_SUCCESS'

const succeedUpdate = (payload: UpdateSuccessPayload): UpdateSuccessAction => ({
  type: actionTypes.UPDATE_SUCCESS,
  payload,
})

const FETCH_SUCCESS = '@@kraken/FETCH_SUCCESS'

const succeedFetch = (payload: FetchSuccessPayload): FetchSuccessAction => ({
  type: actionTypes.FETCH_SUCCESS,
  payload,
})

const REMOVE_SUCCESS = '@@kraken/REMOVE_SUCCESS'

const succeedRemove = (payload: RemoveSuccessPayload): RemoveSuccessAction => ({
  type: actionTypes.REMOVE_SUCCESS,
  payload,
})

const CREATE_FAILURE = '@@kraken/CREATE_FAILURE'

const failCreate = (payload: CreateFailurePayload): CreateFailureAction => ({
  type: actionTypes.CREATE_FAILURE,
  payload,
})
const UPDATE_FAILURE = '@@kraken/UPDATE_FAILURE'

const failUpdate = (payload: UpdateFailurePayload): UpdateFailureAction => ({
  type: actionTypes.UPDATE_FAILURE,
  payload,
})

const FETCH_FAILURE = '@@kraken/FETCH_FAILURE'

const failFetch = (payload: FetchFailurePayload): FetchFailureAction => ({
  type: actionTypes.FETCH_FAILURE,
  payload,
})

const REMOVE_FAILURE = '@@kraken/REMOVE_FAILURE'

const failRemove = (payload: RemoveFailurePayload): RemoveFailureAction => ({
  type: actionTypes.REMOVE_FAILURE,
  payload,
})

const REQUEST_START = '@@kraken/REQUEST_START'

const startRequest = (payload: RequestStartPayload): RequestStartAction => ({
  type: actionTypes.REQUEST_START,
  payload,
})

const WIPE_CACHE = '@@kraken/WIPE_CACHE'

// Non entityType specific action creator
const wipe = () => ({
  type: actionTypes.WIPE_CACHE,
})

export const actionTypes = {
  CREATE_DISPATCH,
  UPDATE_DISPATCH,
  FETCH_DISPATCH,
  REMOVE_DISPATCH,
  CREATE_SUCCESS,
  UPDATE_SUCCESS,
  FETCH_SUCCESS,
  REMOVE_SUCCESS,
  CREATE_FAILURE,
  UPDATE_FAILURE,
  FETCH_FAILURE,
  REMOVE_FAILURE,
  REQUEST_START,
  WIPE_CACHE,
}

const actionCreatorMap: ActionCreatorMap = {
  dispatchCreate,
  dispatchUpdate,
  dispatchFetch,
  dispatchRemove,

  succeedCreate,
  succeedUpdate,
  succeedFetch,
  succeedRemove,

  failCreate,
  failUpdate,
  failFetch,
  failRemove,

  startRequest,
}

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
