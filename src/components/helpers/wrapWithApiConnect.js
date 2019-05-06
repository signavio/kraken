import hoistStatics from 'hoist-non-react-statics'
import React, { createRef, useEffect } from 'react'

import { promisePropsEqual } from '../../utils'
import { ELEMENT_ID_PROP_NAME } from './constants'
import getDisplayName from './getDisplayName'

const wrapWithApiConnect = ({
  finalMapPropsToPromiseProps,
}) => WrappedComponent => {
  const promisePropsRef = createRef()

  function ApiConnect({ [ELEMENT_ID_PROP_NAME]: elementId, innerRef, ...rest }) {
    const promiseProps = finalMapPropsToPromiseProps(rest)
    const prevPromiseProps = promisePropsRef.current || {}
    promisePropsRef.current = promiseProps

    const fetchProps = Object.keys(promiseProps).reduce((props, propName) => {
      const promiseProp = promiseProps[propName]

      if (promiseProp.method !== 'fetch') {
        return props
      }

      return {
        ...props,
        [propName]: rest[propName]
      }
    }, {})

    useEffect(() => {
      Object.keys(fetchProps).forEach((propName) => {
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
        const needsFetch = !isInCache || hasNewRefreshToken

        if (promisePropUpdated && needsFetch && !promiseProp.lazy) {
          fetchProp()
        }
      })

      return () => promisePropsRef.current = null
    })

    return <WrappedComponent {...rest} ref={innerRef} />
  }

  ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
  ApiConnect.WrappedComponent = WrappedComponent

  return hoistStatics(ApiConnect, WrappedComponent)
}

export default wrapWithApiConnect
