// @flow
import invariant from 'invariant'
import { capitalize, uniqueId } from 'lodash'
import { denormalize } from 'normalizr'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
      denormalize: denormalizeValue,
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

    const memoizedQuery = useMemoized(query)
    const memoizedRequestParams = useMemoized(requestParams)

    const [elementId] = useState(() => uniqueId())
    const krakenState = useSelector(({ kraken }) => kraken)
    const dispatch = useDispatch()
    const actionCreator = useActionCreator(actionCreators, method, {
      entityType,
      query: memoizedQuery,
      requestParams: memoizedRequestParams,
      refresh,
      elementId,
      denormalize: denormalizeValue,
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
      if (
        Array.isArray(currentEntityState) &&
        !shallowEqual(currentEntityState, lastEntityState.current)
      ) {
        lastEntityState.current = currentEntityState

        return currentEntityState
      }

      if (lastEntityState.current !== currentEntityState) {
        lastEntityState.current = currentEntityState

        return currentEntityState
      }

      return lastEntityState.current
    }, [currentEntityState])

    const initialRun = useRef(true)
    const queryRef = useRef(
      stringifyQuery({ ...memoizedQuery, ...memoizedRequestParams })
    )
    const refreshRef = useRef(refresh)

    if (method === 'fetch' && !lazy) {
      if (initialRun.current && !entityState) {
        initialRun.current = false

        promiseProp()
      } else if (
        queryRef.current !==
          stringifyQuery({ ...memoizedQuery, ...memoizedRequestParams }) ||
        refreshRef.current !== refresh
      ) {
        queryRef.current = stringifyQuery({
          ...memoizedQuery,
          ...memoizedRequestParams,
        })
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
      value: denormalizeValue
        ? denormalize(
            entityState,
            apiTypes[entityType].schema,
            krakenState.entities
          )
        : entityState,
    })

    useEffect(() => {
      setPromiseState((currentPromiseState) => ({
        ...currentPromiseState,
        ...requestState,
        value: denormalizeValue
          ? denormalize(
              entityState,
              apiTypes[entityType].schema,
              krakenState.entities
            )
          : entityState,
      }))
    }, [
      denormalizeValue,
      entityState,
      entityType,
      krakenState.entities,
      requestState,
    ])

    return [promiseState, promiseProp]
  }
}

const useMemoized = (value) => {
  const [memoizedValue, setMemoizedValue] = useState(value)

  useEffect(() => {
    if (!shallowEqual(memoizedValue, value)) {
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
            denormalizeValue: denormalize,
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
