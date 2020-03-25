import hoistStatics from 'hoist-non-react-statics'
import React, { useEffect, useRef, useState } from 'react'
import { shallowEqual } from 'react-redux'

import { promisePropsEqual } from '../../utils'
import { ELEMENT_ID_PROP_NAME } from './constants'
import getDisplayName from './getDisplayName'

const wrapWithApiConnect = ({
  finalMapPropsToPromiseProps,
}) => WrappedComponent => {
  function ApiConnect({ [ELEMENT_ID_PROP_NAME]: _, innerRef, ...rest }) {
    const promisePropsRef = useRef({})

    const promiseProps = finalMapPropsToPromiseProps(rest)

    const [fetchProps, setFetchProps] = useState(() =>
      Object.keys(promiseProps).reduce((props, propName) => {
        const promiseProp = promiseProps[propName]

        if (promiseProp.method !== 'fetch') {
          return props
        }

        return {
          ...props,
          [propName]: rest[propName],
        }
      }, {})
    )

    useEffect(() => {
      const newFetchProps = Object.keys(promiseProps).reduce(
        (props, propName) => {
          const promiseProp = promiseProps[propName]

          if (promiseProp.method !== 'fetch') {
            return props
          }

          return {
            ...props,
            [propName]: rest[propName],
          }
        },
        {}
      )

      if (!shallowEqual(newFetchProps, fetchProps)) {
        setFetchProps(newFetchProps)
      }
    }, [fetchProps, promiseProps, rest])

    useEffect(() => {
      Object.keys(fetchProps).forEach(propName => {
        const fetchProp = fetchProps[propName]
        const promiseProp = promiseProps[propName]
        // always refresh on any change of the query or if the refresh token is set
        // and changed since the last render
        const promisePropUpdated =
          !promisePropsRef.current[propName] ||
          !promisePropsEqual(
            promiseProps[propName],
            promisePropsRef.current[propName]
          )

        const isInCache = !!fetchProp.value
        const hasNewRefreshToken =
          promiseProp.refresh !== undefined &&
          promiseProp.refresh !== fetchProp.refresh

        if (
          ((promisePropUpdated && !isInCache) || hasNewRefreshToken) &&
          !promiseProp.lazy
        ) {
          fetchProp()
        }
      })

      promisePropsRef.current = promiseProps
    }, [fetchProps, promiseProps])

    return <WrappedComponent {...rest} ref={innerRef} />
  }

  ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
  ApiConnect.WrappedComponent = WrappedComponent

  return hoistStatics(ApiConnect, WrappedComponent)
}

export default wrapWithApiConnect
