import hoistStatics from 'hoist-non-react-statics'
import { uniqueId } from 'lodash'
import React, { forwardRef, useState } from 'react'

import { ELEMENT_ID_PROP_NAME } from './constants'
import getDisplayName from './getDisplayName'

const injectElementIdProp = (WrappedComponent) => {
  function InjectElementIdProp(props, ref) {
    const [elementId] = useState(uniqueId())
    const krakenProps = {
      [ELEMENT_ID_PROP_NAME]: elementId
    }

    return <WrappedComponent {...props} {...krakenProps} innerRef={ref} />
  }

  InjectElementIdProp.displayName = `InjectElementIdProp(${getDisplayName(WrappedComponent)})`
  InjectElementIdProp.WrappedComponent = WrappedComponent

  return hoistStatics(forwardRef(InjectElementIdProp), WrappedComponent)
}

export default injectElementIdProp
