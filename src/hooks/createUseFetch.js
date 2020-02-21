// @flow
import invariant from 'invariant'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import createActionCreators from '../actions'
import {
  type ApiTypeMap,
  type Query,
  type RequestAction,
  type RequestParams,
  type RequestStatus,
} from '../flowTypes'
import { getEntityState, getRequestId, getRequestState } from '../utils'
import useKrakenState from './useKrakenState'
import useMemoized from './useMemoized'

type FetchOptions = {|
  refresh?: boolean | number | string,
  requestParams?: RequestParams,
  lazy?: boolean,
|}

function createUseFetch(apiTypes: ApiTypeMap) {
  const actionCreators = createActionCreators(apiTypes)

  function useFetch<Value>(
    entityType: $Keys<ApiTypeMap>,
    idOrQuery: string | Query,
    options?: FetchOptions
  ): [RequestStatus<Value>, RequestAction<void>] {
    const query = typeof idOrQuery === 'string' ? { id: idOrQuery } : idOrQuery

    const { refresh, requestParams, lazy } = options || {}

    const memoizedQuery = useMemoized(query)
    const memoizedRequestParams = useMemoized(requestParams)

    invariant(
      apiTypes[entityType],
      `Invalid type value '${entityType}' passed to \`connect\` (expected one of: ${Object.keys(
        apiTypes
      ).join(', ')})`
    )

    const resolvedType = apiTypes[entityType]

    invariant(
      typeof resolvedType.fetch === 'function',
      `Invalid method "fetch" specified for api type "${entityType}"`
    )

    const krakenState = useKrakenState()

    const requestId = getRequestId('fetch', query, requestParams)

    const requestState = getRequestState(krakenState, entityType, requestId)

    const entityState = getEntityState<Value>(
      apiTypes,
      krakenState,
      entityType,
      requestId
    )

    const promiseProp = usePromiseProp(actionCreators, entityType, {
      query: memoizedQuery,
      requestParams: memoizedRequestParams,
      refresh,
    })
    const alreadyLoaded = useRef(!!entityState || lazy)

    useEffect(() => {
      if (lazy) {
        return
      }

      promiseProp(alreadyLoaded)
    }, [lazy, promiseProp])

    const memoizedEntityState = useMemoized(entityState)

    const [promiseState, setPromiseState] = useState<RequestStatus<Value>>(
      memoizedEntityState
        ? {
            fulfilled: true,
            pending: false,
            rejected: false,
            status: 200,
            value: memoizedEntityState,
          }
        : {
            pending: true,
            fulfilled: false,
            rejected: false,
            value: memoizedEntityState,
          }
    )

    useEffect(() => {
      if (requestState) {
        if (requestState.fulfilled) {
          invariant(
            memoizedEntityState,
            'Fulfilled request did not result in an entity state.'
          )

          setPromiseState({
            fulfilled: true,
            pending: false,
            rejected: false,
            status: requestState.status,
            value: memoizedEntityState,
          })
        } else if (requestState.pending) {
          setPromiseState({
            fulfilled: false,
            pending: true,
            rejected: false,
            value: memoizedEntityState,
          })
        } else if (requestState.rejected) {
          setPromiseState({
            pending: false,
            fulfilled: false,
            rejected: true,
            status: requestState.status,
            reason: requestState.reason,
            value: void 0,
          })
        }
      }
    }, [memoizedEntityState, requestState])

    return [promiseState, promiseProp]
  }

  return useFetch
}

const usePromiseProp = (
  actionCreators,
  entityType,
  { query, requestParams, refresh }
) => {
  const dispatch = useDispatch()

  const { dispatchFetch } = actionCreators

  return useCallback(
    alreadyLoaded => {
      if (alreadyLoaded && alreadyLoaded.current) {
        alreadyLoaded.current = false

        return
      }

      dispatch(
        dispatchFetch({
          entityType,
          query,
          requestParams,
          refresh,
        })
      )
    },
    [dispatch, dispatchFetch, entityType, query, refresh, requestParams]
  )
}

export default createUseFetch
