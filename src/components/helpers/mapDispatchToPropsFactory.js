import { bindActionCreators } from 'redux'

import invariant from 'invariant'

import { mapValues } from 'lodash'

import { MethodName } from '../../internalTypes'

import actionsCreators from '../../actions'

import { ELEMENT_ID_PROP_NAME, validMethods } from './constants'

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1)

const mapDispatchToPropsFactory = ({
  types,
  finalMapPropsToPromiseProps,
}) => () => {
  const actionCreators = actionsCreators(types)

  return (dispatch, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
    const promiseProps = finalMapPropsToPromiseProps(ownProps)
    const boundActionCreators = bindActionCreators(actionCreators, dispatch)

    const bindActionCreatorForPromiseProp =
    ({ type: entityType, method, query = {}, refresh, requiredFields }, propName) => {
      const actionCreator = boundActionCreators[`dispatch${capitalize(method)}`]
      invariant(!!actionCreator,
        `Unknown method '${method}' specified ` +
        `(supported values: ${validMethods.map((m) => `'${m}'`).join(', ')})`
      )

      switch (method) {
        case 'fetch':
          return () => actionCreator({ entityType, query, refresh, requiredFields })
        case 'create':
          return (body) => actionCreator({ entityType, elementId, query, body })
        case 'update':
          return (body) => actionCreator({ entityType, query, body })
        case 'remove':
          return () => actionCreator({ entityType, query })
      }
    }

    return mapValues(promiseProps, bindActionCreatorForPromiseProp)
  }
}

export default mapDispatchToPropsFactory
