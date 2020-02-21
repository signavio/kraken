// @flow
import invariant from 'invariant'
import { capitalize, uniqueId } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import {
  getEntityState,
  getRequestId,
  getRequestState,
  stringifyQuery,
} from '../utils'
import createUseFetch from './createUseFetch'

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

  function useApi<Body, Value>(
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
    const actionCreator = useActionCreator(actionCreators, method, {
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
      krakenState,
      entityType,
      getRequestId(method, query, requestParams, elementId)
    )

    const lastEntityState = useRef(null)

    const currentEntityState = getEntityState(
      apiTypes,
      krakenState,
      entityType,
      getRequestId(method, query, requestParams, elementId),
      denormalize
    )

    const useMemoized =
      Array.isArray(currentEntityState) &&
      lastEntityState.current &&
      shallowEqual(currentEntityState, lastEntityState.current)

    const entityState = useMemoized
      ? lastEntityState.current
      : currentEntityState

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

  return {
    useApi,
    useFetch: createUseFetch(apiTypes),
  }
}

const usePromiseProp = (
  actionCreators,
  entityType,
  { query, requestParams, refresh, denormalize }
) => {
  const dispatch = useDispatch()

  const { dispatchFetch } = actionCreators

  return useCallback(
    body =>
      dispatch(
        dispatchFetch({
          entityType,
          query,
          requestParams,
          refresh,
          body,
          denormalizeValue: denormalize,
        })
      ),
    [
      denormalize,
      dispatch,
      dispatchFetch,
      entityType,
      query,
      refresh,
      requestParams,
    ]
  )
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

const useActionCreator = (
  actionCreators,
  method: MethodName,
  { entityType, query, requestParams, refresh, elementId, denormalize }
) => {
  return useCallback(
    body => {
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
    },
    [
      actionCreators,
      denormalize,
      elementId,
      entityType,
      method,
      query,
      refresh,
      requestParams,
    ]
  )
}

export default createUseApi
