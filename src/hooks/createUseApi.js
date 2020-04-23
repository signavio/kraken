// @flow
import invariant from 'invariant'
import { capitalize, uniqueId } from 'lodash'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import createActionCreators from '../actions'
import {
  type ApiTypeMap,
  type MethodName,
  type Query,
  type RequestAction,
  type RequestStatus,
} from '../flowTypes'
import { getIdAttribute } from '../types'
import { getEntityState, getRequestState, stringifyQuery } from '../utils'

type BaseOptions = {|
  method?: MethodName,
  requestParams?: Query,
  refresh?: any,
  denormalize?: boolean,
  lazy?: boolean,
  onSuccess?: () => void,
  onFailure?: () => void,
|}

type QueryOptions = {|
  ...BaseOptions,
  query: Query,
|}

type IdOptions = {|
  ...BaseOptions,
  id: string,
|}

type ResolvedOptions = {|
  method: MethodName,
  query: Query,
  requestParams: Query,
  lazy: boolean,
  denormalize: boolean,

  refresh?: any,

  onSuccess?: () => void,
  onFailure?: () => void,
|}

type Options = BaseOptions | QueryOptions | IdOptions

function createUseApi(apiTypes: ApiTypeMap) {
  const actionCreators = createActionCreators(apiTypes)

  return function useApi<Body, Value>(
    entityType: $Keys<ApiTypeMap>,
    options?: Options
  ): [RequestStatus<Value>, RequestAction<Body>] {
    const {
      query,
      method,
      requestParams,
      refresh,
      denormalize,
      lazy,

      onSuccess,
      onFailure,
    } = resolveOptions(apiTypes, entityType, options)

    invariant(
      apiTypes[entityType],
      `Invalid type value '${entityType}' passed to \`connect\` (expected one of: ${Object.keys(
        apiTypes
      ).join(', ')})`
    )

    const resolvedType = apiTypes[entityType]

    invariant(
      typeof resolvedType[method] === 'function',
      `Invalid method "${method}" specified for api type "${entityType}"`
    )

    const [elementId] = useState(uniqueId())
    const krakenState = useSelector(({ kraken }) => kraken)
    const dispatch = useDispatch()
    const actionCreator = getActionCreator(actionCreators, method, {
      entityType,
      query,
      requestParams,
      refresh,
      elementId,
      denormalize,
    })

    const promiseProp = useCallback(body => dispatch(actionCreator(body)), [
      actionCreator,
      dispatch,
    ])

    invariant(
      krakenState,
      'Could not find an API cache in the state (looking at: `state.kraken`)'
    )

    const requestState = getRequestState(
      apiTypes,
      krakenState.requests,
      actionCreator()
    )

    const lastEntityState = useRef(null)

    const currentEntityState = getEntityState(
      apiTypes,
      krakenState,
      actionCreator()
    )

    const entityState = useMemo(() => {
      if (!lastEntityState.current) {
        return currentEntityState
      }

      if (Array.isArray(currentEntityState)) {
        return shallowEqual(currentEntityState, lastEntityState.current)
      }

      return (
        JSON.stringify(currentEntityState) ===
        JSON.stringify(lastEntityState.current)
      )
    }, [lastEntityState, currentEntityState])

    lastEntityState.current = currentEntityState

    const initialRun = useRef(true)
    const queryRef = useRef(stringifyQuery({ ...query, ...requestParams }))
    const refreshRef = useRef(refresh)

    if (method === 'fetch' && !lazy) {
      if (initialRun.current && !entityState) {
        initialRun.current = false

        promiseProp()
      } else if (
        queryRef.current !== stringifyQuery({ ...query, ...requestParams }) ||
        refreshRef.current !== refresh
      ) {
        queryRef.current = stringifyQuery({ ...query, ...requestParams })
        refreshRef.current = refresh

        promiseProp()
      }
    }

    const [initialRequestState] = useState(
      method === 'fetch'
        ? {
            pending: !entityState && !lazy,
            fulfilled: !!entityState,
          }
        : {
            pending: false,
            fulfilled: false,
          }
    )

    useRequestHandlers(requestState || initialRequestState, {
      onSuccess,
      onFailure,
    })

    const [promiseState, setPromiseState] = useState({
      ...(requestState || initialRequestState),
      value: entityState,
    })

    useEffect(() => {
      setPromiseState(currentPromiseState => ({
        ...currentPromiseState,
        ...requestState,
        value: entityState,
      }))
    }, [entityState, requestState])

    return [promiseState, promiseProp]
  }
}

const useRequestHandlers = (requestState, { onSuccess, onFailure }) => {
  useCallbackOnSuccess(requestState, onSuccess)
  useCallbackOnFailure(requestState, onFailure)
}

const useCallbackOnFailure = (requestState, onFailure) => {
  const pendingRef = useRef(null)

  const { pending, rejected } = requestState

  useEffect(() => {
    if (!onFailure) {
      return
    }

    if (pendingRef.current === null && rejected) {
      onFailure()
    }

    if (pendingRef.current && !pending && rejected) {
      onFailure()
    }

    pendingRef.current = pending
  }, [pending, rejected, onFailure])
}

const useCallbackOnSuccess = (requestState, onSuccess) => {
  const pendingRef = useRef(null)

  const { pending, fulfilled } = requestState

  useEffect(() => {
    if (!onSuccess) {
      return
    }

    if (pendingRef.current === null && fulfilled) {
      onSuccess()
    }

    if (pendingRef.current && !pending && fulfilled) {
      onSuccess()
    }

    pendingRef.current = pending
  }, [pending, fulfilled, onSuccess])
}

const resolveOptions = (
  apiTypes,
  entityType,
  options: ?Options
): ResolvedOptions => {
  const defaultOptions = {
    query: {},
    requestParams: {},
    method: 'fetch',
    denormalize: false,
    lazy: false,
  }

  if (options) {
    if (options.id) {
      const { id, ...rest } = options

      return {
        ...defaultOptions,
        ...rest,

        query: {
          [getIdAttribute(apiTypes, entityType)]: id,
        },
      }
    }

    if (options.query) {
      return {
        ...defaultOptions,
        ...options,
      }
    }

    // $FlowFixMe
    return {
      ...defaultOptions,
      ...options,
    }
  }

  return {
    ...defaultOptions,
  }
}

const getActionCreator = (
  actionCreators,
  method: MethodName,
  { entityType, query, requestParams, refresh, elementId, denormalize }
) => {
  const actionCreator = actionCreators[`dispatch${capitalize(method)}`]

  switch (method) {
    case 'fetch':
      return body =>
        actionCreator({
          entityType,
          query,
          requestParams,
          refresh,
          body,
          denormalizeValue: denormalize,
        })

    case 'create':
      return body =>
        actionCreator({
          entityType,
          elementId,
          query,
          requestParams,
          body,
        })

    case 'update':
    case 'remove':
      return body =>
        actionCreator({
          entityType,
          query,
          requestParams,
          body,
        })

    default:
      invariant(false, `Unknown method ${method}`)
  }
}

export default createUseApi
