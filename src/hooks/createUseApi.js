// @flow
import invariant from 'invariant'
import { capitalize, uniqueId } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { shallowEqualArrays, shallowEqualObjects } from 'shallow-equal'

import createActionCreators from '../actions'
import {
  type ApiTypeMap,
  type FulfilledRequest,
  type FutureRequest,
  type MethodName,
  type PendingRequest,
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
  lazy?: boolean,
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

  refresh?: any,
|}

type Options = BaseOptions | QueryOptions | IdOptions

function createUseApi(apiTypes: ApiTypeMap) {
  const actionCreators = createActionCreators(apiTypes)

  function useApi<Body, Value>(
    entityType: $Keys<ApiTypeMap>,
    options?: Options
  ): [RequestStatus<Value>, RequestAction<Body>] {
    const { query, method, requestParams, refresh, lazy } = resolveOptions(
      apiTypes,
      entityType,
      options
    )

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

    const memoizedQuery = useMemoized(query)
    const memoizedRequestParams = useMemoized(requestParams)

    const [elementId] = useState(() => uniqueId())
    const krakenState = useSelector(({ kraken }) => kraken)
    const dispatch = useDispatch()
    const actionCreator = useActionCreator(method, {
      entityType,
      query: memoizedQuery,
      requestParams: memoizedRequestParams,
      refresh,
      elementId,
    })

    const promiseProp = useCallback((body) => dispatch(actionCreator(body)), [
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

    const currentEntityState = getEntityState(
      apiTypes,
      krakenState,
      actionCreator()
    )
    const lastEntityState = useRef(currentEntityState)

    const entityState = useMemo(() => {
      if (Array.isArray(currentEntityState)) {
        if (!shallowEqualArrays(currentEntityState, lastEntityState.current)) {
          lastEntityState.current = currentEntityState

          return currentEntityState
        }
      } else {
        if (lastEntityState.current !== currentEntityState) {
          lastEntityState.current = currentEntityState

          return currentEntityState
        }
      }

      return lastEntityState.current
    }, [currentEntityState])

    useFetchOnInitialMount(method, lazy, entityState, promiseProp)
    useReFetchOnRefresh(refresh, method, lazy, promiseProp)
    const willReFetch = useReFetchOnQueryChange(
      method,
      lazy,
      memoizedQuery,
      memoizedRequestParams,
      entityState,
      promiseProp
    )

    const [promiseState, setPromiseState] = useState(() => {
      if (requestState) {
        return {
          ...requestState,
          value: entityState,
        }
      }

      if (method !== 'fetch') {
        return ({
          pending: false,
          fulfilled: false,
          rejected: false,
          value: entityState,
        }: FutureRequest<Value>)
      }

      if (!entityState && !lazy) {
        return ({
          pending: true,
          fulfilled: false,
          rejected: false,
          value: entityState,
        }: PendingRequest<Value>)
      }

      if (entityState) {
        return ({
          pending: false,
          fulfilled: true,
          rejected: false,
          status: 200,
          value: entityState,
        }: FulfilledRequest<Value>)
      }

      return ({
        pending: false,
        fulfilled: false,
        rejected: false,
        value: entityState,
      }: FutureRequest<Value>)
    })

    useEffect(() => {
      setPromiseState((currentPromiseState) => ({
        ...currentPromiseState,
        ...requestState,

        fulfilled:
          (willReFetch ? false : requestState?.fulfilled) ??
          currentPromiseState.fulfilled,
        pending:
          (willReFetch ? true : requestState?.pending) ??
          currentPromiseState.pending,

        value: entityState,
      }))
    }, [entityState, requestState, willReFetch])

    return [promiseState, promiseProp]
  }

  const useActionCreator = (
    method: MethodName,
    { entityType, query, requestParams, refresh, elementId }
  ) => {
    const actionCreator = actionCreators[`dispatch${capitalize(method)}`]

    return useCallback(
      (body) => {
        switch (method) {
          case 'fetch':
            return actionCreator({
              entityType,
              query,
              requestParams,
              refresh,
              body,
            })

          case 'create':
            return actionCreator({
              entityType,
              elementId,
              query,
              requestParams,
              body,
            })

          case 'update':
          case 'remove':
            return actionCreator({
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
        actionCreator,
        elementId,
        entityType,
        method,
        query,
        refresh,
        requestParams,
      ]
    )
  }

  return useApi
}

const useReFetchOnQueryChange = (
  method,
  lazy,
  query,
  requestParams,
  entityState,
  promiseProp
) => {
  const queryRef = useRef(stringifyQuery({ ...query, ...requestParams }))

  const stringQuery = stringifyQuery({
    ...query,
    ...requestParams,
  })

  let needsReFetch = false

  if (method === 'fetch' && !lazy) {
    if (queryRef.current !== stringQuery && !entityState) {
      needsReFetch = true
    }
  }

  useEffect(() => {
    if (needsReFetch) {
      promiseProp()
    }
  }, [needsReFetch, promiseProp])

  return needsReFetch
}

const useReFetchOnRefresh = (refresh, method, lazy, promiseProp) => {
  const refreshRef = useRef(refresh)

  useEffect(() => {
    if (method === 'fetch' && !lazy && refreshRef.current !== refresh) {
      refreshRef.current = refresh

      promiseProp()
    }
  }, [lazy, method, promiseProp, refresh])
}

const useFetchOnInitialMount = (method, lazy, entityState, promiseProp) => {
  const initialRun = useRef(true)

  useEffect(() => {
    if (method === 'fetch' && !lazy) {
      if (initialRun.current && !entityState) {
        initialRun.current = false

        promiseProp()
      }
    }
  }, [entityState, lazy, method, promiseProp])
}

const useMemoized = (value) => {
  const [memoizedValue, setMemoizedValue] = useState(value)

  useEffect(() => {
    if (!shallowEqualObjects(memoizedValue, value)) {
      setMemoizedValue(value)
    }
  }, [memoizedValue, value])

  return memoizedValue
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

  return defaultOptions
}

export default createUseApi
