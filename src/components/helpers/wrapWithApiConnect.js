import { Component, createElement } from 'react'

import invariant from 'invariant'
import hoistStatics from 'hoist-non-react-statics'
import forEach from 'lodash/forEach'


import { promisePropsEqual } from '../../utils'
import getDisplayName from './getDisplayName'
import { ELEMENT_ID_PROP_NAME } from './constants'

const wrapWithApiConnect = ({ finalMapPropsToPromiseProps, withRef }) => (WrappedComponent) => {
  class ApiConnect extends Component {

    componentWillMount() {
      this.loadEntities(this.props)
    }

    componentWillUpdate(nextProps) {
      this.loadEntities(nextProps, this.props)
    }

    render() {
      const { [ELEMENT_ID_PROP_NAME]: elementId, ...rest } = this.props
      return createElement(
        WrappedComponent, {
          ...rest,
          ...(withRef ? { ref: 'wrappedInstance' } : {}),
        }
      )
    }

    loadEntities(props, prevProps) {
      const promiseProps = finalMapPropsToPromiseProps(props)
      const prevPromiseProps = prevProps ? finalMapPropsToPromiseProps(prevProps) : {}

      forEach(promiseProps, (promiseProp, propName) => {
        const { method } = promiseProp
        const promisePropUpdated = !prevPromiseProps[propName] ||
          !promisePropsEqual(promiseProp, prevPromiseProps[propName])

        if (method === 'fetch' && promisePropUpdated && !promiseProp.lazy) {
          props[propName]()
        }
      })
    }

    getWrappedInstance() {
      invariant(withRef,
        'To access the wrapped instance, you need to specify ' +
        '{ withRef: true } as the second argument of the connect() call.'
      )

      return this.refs.wrappedInstance
    }
  }

  ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
  ApiConnect.WrappedComponent = WrappedComponent
  return hoistStatics(ApiConnect, WrappedComponent)
}

export default wrapWithApiConnect
