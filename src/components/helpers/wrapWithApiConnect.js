import hoistStatics from 'hoist-non-react-statics'
import React, { useEffect, useRef } from 'react'

import { promisePropsEqual } from '../../utils'
import { ELEMENT_ID_PROP_NAME } from './constants'
import getDisplayName from './getDisplayName'

const wrapWithApiConnect = ({
  finalMapPropsToPromiseProps,
}) => WrappedComponent => {
  function ApiConnect({ [ELEMENT_ID_PROP_NAME]: _, innerRef, ...rest }) {
    const promisePropsRef = useRef({})

    const promiseProps = finalMapPropsToPromiseProps(rest)
    const prevPromiseProps = promisePropsRef.current

    const fetchProps = Object.keys(promiseProps).reduce((props, propName) => {
      const promiseProp = promiseProps[propName]

      if (promiseProp.method !== 'fetch') {
        return props
      }

      return {
        ...props,
        [propName]: rest[propName],
      }
    }, {})

    useEffect(() => {
      Object.keys(fetchProps).forEach(propName => {
        const fetchProp = fetchProps[propName]
        const promiseProp = promiseProps[propName]
        // always refresh on any change of the query or if the refresh token is set
        // and changed since the last render
        const promisePropUpdated =
          !prevPromiseProps[propName] ||
          !promisePropsEqual(promiseProps[propName], prevPromiseProps[propName])

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
    })

    return <WrappedComponent {...rest} ref={innerRef} />
  }

  ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
  ApiConnect.WrappedComponent = WrappedComponent

  return hoistStatics(ApiConnect, WrappedComponent)
}

export default wrapWithApiConnect
