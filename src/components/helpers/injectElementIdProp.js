import { Component, createElement } from 'react'
import invariant from 'invariant'

import hoistStatics from 'hoist-non-react-statics'

import { uniqueId } from 'lodash'

import getDisplayName from './getDisplayName'

import { ELEMENT_ID_PROP_NAME } from './constants'

const injectElementIdProp = ({ withRef }) => (WrappedComponent) => {
  class InjectElementIdProp extends Component {

    constructor(props) {
      super(props)
      this.elementId = uniqueId()
    }

    render() {
      return createElement(
        WrappedComponent, {
          ...this.props,
          [ELEMENT_ID_PROP_NAME]: this.elementId,
          ...(withRef ? { ref: 'wrappedInstance' } : {}),
        }
      )
    }

    getWrappedInstance() {
      invariant(withRef,
        'To access the wrapped instance, you need to specify ' +
        '{ withRef: true } as the second argument of the connect() call.'
      )

      // 3 levels of component wrapping:
      // InjectElementIdProp(Connect(ApiConnect(WrappedComponent)))
      return this.refs.wrappedInstance.getWrappedInstance().getWrappedInstance()
    }
  }

  InjectElementIdProp.displayName = `InjectElementIdProp(${getDisplayName(WrappedComponent)})`
  InjectElementIdProp.WrappedComponent = WrappedComponent
  return hoistStatics(InjectElementIdProp, WrappedComponent)
}

export default injectElementIdProp
