import hoistStatics from 'hoist-non-react-statics'
import React, { createRef, forwardRef, useEffect } from 'react'

import { promisePropsEqual } from '../../utils'
import { ELEMENT_ID_PROP_NAME } from './constants'
import getDisplayName from './getDisplayName'

const wrapWithApiConnect = ({
  finalMapPropsToPromiseProps,
}) => WrappedComponent => {
  function ApiConnect({ [ELEMENT_ID_PROP_NAME]: elementId, innerRef, ...rest }, ref) {
    const promisePropsRef = createRef()

    useEffect(() => {
      const promiseProps = finalMapPropsToPromiseProps(rest)
      const prevPromiseProps = promisePropsRef.current || {}

      Object.keys(promiseProps, (propName) => {
        const promiseProp = promiseProps[propName]
        const { method } = promiseProp

        if (method !== 'fetch') {
          return
        }

        // always refresh on any change of the query or if the refresh token is set
        // and changed since the last render
        const promisePropUpdated =
          !prevPromiseProps[propName] ||
          !promisePropsEqual(promiseProp, prevPromiseProps[propName])

        const { fetchOnMount } = promiseProps[propName]
        const hasJustMounted = promisePropsRef.current === undefined
        const shallForceFetch = fetchOnMount && hasJustMounted
        const isInCache = !!rest[propName].value
        const hasNewRefreshToken =
          promiseProp.refresh !== undefined &&
          promiseProp.refresh !== rest[propName].refresh
        const needsFetch = shallForceFetch || !isInCache || hasNewRefreshToken

        if (promisePropUpdated && needsFetch && !promiseProp.lazy) {
          rest[propName]()
        }
      })

      promisePropsRef.current = promiseProps
    })

    return <WrappedComponent {...rest} ref={innerRef} />
  }

  ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
  ApiConnect.WrappedComponent = WrappedComponent
  return hoistStatics(forwardRef(ApiConnect), WrappedComponent)
}

export default wrapWithApiConnect
