import { bindActionCreators } from 'redux'

import invariant from 'invariant'

import mapValues from 'lodash/mapValues'

import actionsCreators from '../../actions'
import { deriveRequestId } from '../../utils'

import { ELEMENT_ID_PROP_NAME, VALID_METHODS } from './constants'
const mapDispatchToPropsFactory = ({
  types,
  finalMapPropsToPromiseProps,
}) => () => {
  const actionCreators = actionsCreators(types)
  const lastPromiseProps = {}
  const lastActionCreators = {}

  return (dispatch, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
    const promiseProps = finalMapPropsToPromiseProps(ownProps)
    const boundActionCreators = bindActionCreators(actionCreators, dispatch)

    const bindActionCreatorForPromiseProp =
    ({ type, method, query, refresh, requiredFields }, propName) => {
      const actionCreator = boundActionCreators[`${method}Entity`]
      invariant(!!actionCreator,
        `Unknown method '${method}' specified ` +
        `(supported values: ${VALID_METHODS.map(m => `'${m}'`).join(', ')})`
      )

      switch (method) {
        case 'fetch':
          return actionCreator.bind(null, type, query, refresh, requiredFields)
        case 'create':
          return actionCreator.bind(
            null, type, deriveRequestId(method, { elementId, propName })
          )
        default:
          return actionCreator.bind(null, type, query)
      }
    }

    const memoizedActionCreatorForPromiseProps = (promiseProp, propName) => {
      lastPromiseProps[propName] = promiseProp
      lastActionCreators[propName] = bindActionCreatorForPromiseProp(promiseProp, propName)

      return lastActionCreators[propName]
    }

    return mapValues(promiseProps, bindActionCreatorForPromiseProp)
  }
}

export default mapDispatchToPropsFactory
