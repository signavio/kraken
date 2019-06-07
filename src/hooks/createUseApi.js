// @flow
import invariant from 'invariant'
import { capitalize, uniqueId } from 'lodash'
import { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import shallowEqual from 'react-redux/lib/utils/shallowEqual'

import createActionCreators from '../actions'
import { type ApiTypeMap, type MethodName, type Query } from '../internalTypes'
import { getIdAttribute } from '../types'
import { getEntityState, getRequestState, stringifyQuery } from '../utils'

type BaseOptions = {|
  method?: MethodName,
  requestParams?: Query,
  refresh?: any,
  denormalize?: boolean,
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

type Options = BaseOptions | QueryOptions | IdOptions

function createUseApi(apiTypes: ApiTypeMap) {
  const actionCreators = createActionCreators(apiTypes)

  return (entityType: $Keys<ApiTypeMap>, options?: Options) => {
    let query = {}
    let requestParams = {}
    let method = 'fetch'
    let refresh
    let denormalize = false
    let lazy = false

    invariant(
      apiTypes[entityType],
      `Invalid type value '${entityType}' passed to \`connect\` (expected one of: ${Object.keys(
        apiTypes
      ).join(', ')})`
    )

    const resolvedType = apiTypes[entityType]

    invariant(
      typeof resolvedType[method] === 'function',
      `Invalid method '${method}' specified for api type "${entityType}"`
    )

    if (options) {
      method = options.method || method
      requestParams = options.requestParams || requestParams
      refresh = options.refresh
      denormalize = options.denormalize || denormalize
      lazy = options.lazy || lazy

      if (options.id) {
        query = {
          [getIdAttribute(apiTypes, entityType)]: options.id,
        }
      } else if (options.query) {
        query = options.query
      }
    }

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

    const initialRequestState =
      method === 'fetch'
        ? {
            pending: !entityState && !lazy,
            fulfilled: !!entityState,
          }
        : {
            pending: false,
            fulfilled: false,
          }

    const promiseState = {
      ...(requestState || initialRequestState),
      value: entityState,
    }

    return Object.assign(promiseProp, promiseState)
  }
}

const getActionCreator = (
  actionCreators,
  method,
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
      invariant(false, `Unkown method ${method}`)
  }
}

export default createUseApi
