// @flow
import { bindActionCreators } from 'redux'
import invariant from 'invariant'
import { mapValues } from 'lodash'

import actionsCreators from '../../actions'
import type {
  ApiTypeMap,
  PromiseProp,
  DispatchPayload,
  Body,
} from '../../internalTypes'

import { ELEMENT_ID_PROP_NAME, validMethods } from './constants'

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1)

type ParamsT = {
  types: ApiTypeMap,
  finalMapPropsToPromiseProps: (
    props: any
  ) => { [promiseProp: string]: PromiseProp<*> },
}

const mapDispatchToPropsFactory = ({
  types,
  finalMapPropsToPromiseProps,
}: ParamsT) => () => {
  const actionCreators = actionsCreators(types)

  return (
    dispatch,
    { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }: DispatchPayload
  ) => {
    const promiseProps = finalMapPropsToPromiseProps(ownProps)
    const boundActionCreators = bindActionCreators(actionCreators, dispatch)

    const bindActionCreatorForPromiseProp = ({
      type: entityType,
      method,
      query = {},
      refresh,
      requiredFields,
    }) => {
      const actionCreator = boundActionCreators[`dispatch${capitalize(method)}`]
      invariant(
        !!actionCreator,
        `Unknown method '${method}' specified ` +
          `(supported values: ${validMethods
            .map((validMathod: string) => `'${validMathod}'`)
            .join(', ')})`
      )

      switch (method) {
        case 'fetch':
          return (body: Body) =>
            actionCreator({ entityType, query, refresh, requiredFields, body })
        case 'create':
          return (body: Body) =>
            actionCreator({ entityType, elementId, query, body })
        case 'update':
          return (body: Body) => actionCreator({ entityType, query, body })
        case 'remove':
          return (body: Body) => actionCreator({ entityType, query, body })
        default:
          throw new Error(`Unkown dispatch method ${method}`)
      }
    }

    return mapValues(promiseProps, bindActionCreatorForPromiseProp)
  }
}

export default mapDispatchToPropsFactory
