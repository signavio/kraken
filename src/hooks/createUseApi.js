// @flow
import invariant from 'invariant'
import { capitalize, shallowEqual, uniqueId } from 'lodash'
import { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import createActionCreators, { actionTypes } from '../actions'
import { type ApiTypeMap, type MethodName, type Query } from '../internalTypes'
import { getIdAttribute } from '../types'
import { getEntityState, getRequestState } from '../utils'

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
      resolvedType[method],
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
    const actionCreator = actionCreators[`dispatch${capitalize(method)}`]

    const promiseProp = useCallback(
      body => {
        switch (method) {
          case 'fetch':
            dispatch(
              actionCreator({ entityType, query, requestParams, refresh, body })
            )

            break
          case 'create':
            dispatch(
              actionCreator({
                entityType,
                elementId,
                query,
                requestParams,
                body,
              })
            )

            break
          case 'update':
          case 'remove':
            dispatch(
              actionCreator({
                entityType,
                query,
                requestParams,
                body,
              })
            )

            break
          default:
            invariant(false, `Unkown dispatch method ${method}`)
        }
      },
      [
        actionCreator,
        dispatch,
        elementId,
        entityType,
        method,
        query,
        refresh,
        requestParams,
      ]
    )

    invariant(
      krakenState,
      'Could not find an API cache in the state (looking at: `state.kraken`)'
    )

    const requestState = getRequestState(
      apiTypes,
      krakenState.requests,
      actionCreator({ entityType, query, requestParams, elementId })
    )

    const lastEntityState = useRef(null)

    const currentEntityState = getEntityState(
      apiTypes,
      krakenState,
      actionCreator({
        entityType,
        query,
        requestParams,
        refresh,
        elementId,
        denormalizeValue: denormalize,
      })
    )

    const useMemoized =
      Array.isArray(currentEntityState) &&
      lastEntityState.current &&
      shallowEqual(currentEntityState, lastEntityState.current)

    const entityState = useMemoized
      ? lastEntityState.current
      : currentEntityState

    lastEntityState.current = currentEntityState

    const initialPromise =
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
      ...(requestState || initialPromise),
      value: entityState,
    }

    return Object.assign(promiseProp, promiseState)
  }
}

export default createUseApi
