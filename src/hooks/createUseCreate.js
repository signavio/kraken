// @flow
import invariant from 'invariant'
import { uniqueId } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import createActionCreators from '../actions'
import {
  type ApiTypeMap,
  type Query,
  type RequestAction,
  type RequestParams,
  type RequestStatus,
} from '../flowTypes'
import { getEntityState, getRequestId, getRequestState } from '../utils'
import useMemoized from './useMemoized'

function createUseCreate(apiTypes: ApiTypeMap) {
  const actionCreators = createActionCreators(apiTypes)

  function useCreate<Body, Value>(
    entityType: $Keys<ApiTypeMap>,
    query?: Query,
    requestParams?: RequestParams
  ): [RequestStatus<Value>, RequestAction<Body>] {
    invariant(
      apiTypes[entityType],
      `Invalid type value '${entityType}' passed to \`connect\` (expected one of: ${Object.keys(
        apiTypes
      ).join(', ')})`
    )

    const resolvedType = apiTypes[entityType]

    invariant(
      typeof resolvedType.create === 'function',
      `Invalid method "create" specified for api type "${entityType}"`
    )

    const memoizedQuery = useMemoized(query)
    const memoizedRequestParams = useMemoized(requestParams)

    const [elementId] = useState(() => uniqueId())
    const krakenState = useSelector(({ kraken }) => kraken)

    const promiseProp = usePromiseProp(
      actionCreators,
      entityType,
      memoizedQuery,
      memoizedRequestParams
    )

    invariant(
      krakenState,
      'Could not find an API cache in the state (looking at: `state.kraken`)'
    )

    const requestId = getRequestId(
      'create',
      memoizedQuery,
      memoizedRequestParams,
      elementId
    )

    const requestState = getRequestState(krakenState, entityType, requestId)

    const entityState = getEntityState(
      apiTypes,
      krakenState,
      entityType,
      requestId
    )

    const [promiseState, setPromiseState] = useState<RequestStatus<Value>>({
      fulfilled: false,
      rejected: false,
      pending: false,

      value: undefined,
    })

    const memoizedEntityState = useMemoized(entityState)

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

  return useCreate
}

const usePromiseProp = (actionCreators, entityType, query, requestParams) => {
  const dispatch = useDispatch()

  const { dispatchCreate } = actionCreators

  return useCallback(
    body => {
      dispatch(
        dispatchCreate({
          entityType,
          query,
          requestParams,
          body,
        })
      )
    },
    [dispatch, dispatchCreate, entityType, query, requestParams]
  )
}

export default createUseCreate
