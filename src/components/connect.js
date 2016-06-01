import { Component, createElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import invariant from 'invariant'
import hoistStatics from 'hoist-non-react-statics'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import mapKeys from 'lodash/mapKeys'

import fpMapValues from 'lodash/fp/mapValues'
import compose from 'lodash/fp/compose'
import pickBy from 'lodash/fp/pickBy'

import actionsCreators from '../actions'
import { getPromiseState, getEntityState } from '../utils'
import { getIdAttribute } from '../types'


function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

const validMethods = ['fetch', 'create', 'update', 'remove']

const validatePromiseProps = (types) => fpMapValues((props) => {
  const { type, method = 'fetch', id, query } = props

  invariant(
    type && types[type],
    `Invalid type value '${type}' passed to \`connect\` ` +
    `(expected one of: ${Object.keys(types).join(', ')})`
  )

  invariant(
    validMethods.indexOf(method) >= 0,
    `Invalid method '${method}' specified for \`connect\` ` +
    `(expected one of: ${validMethods.join(', ')})`
  )

  invariant(!(id && query), `Must only define one of the 'id' and 'query' parameters`)

  return props
})

const mapIdToQuery = (types) => fpMapValues((props) => {
  const { method = 'fetch', id, query, type, ...rest } = props
  if (method !== 'fetch') return props
  return {
    query: id ? { [getIdAttribute(types, type)]: id } : query || {},
    type,
    ...rest,
  }
})

export default (types) => {
  return (mapPropsToPromiseProps = () => ({}), options = {}) => {
    const { withRef = false } = options

    // filter out empty promise prop mappings and
    // transform convenience id syntax into regular queries
    const finalMapPropsToPromiseProps = compose(
      mapIdToQuery(types),
      validatePromiseProps(types),
      pickBy(Boolean), // remove falsy values
      mapPropsToPromiseProps
    )

    const wrapWithApiConnect = (WrappedComponent) => {
      class ApiConnect extends Component {

        componentWillMount() {
          this.loadEntities(this.props)
        }

        render() {
          return createElement(
            WrappedComponent, {
              ...this.props,
              ...(withRef ? { ref: 'wrappedInstance' } : {}),
            }
          )
        }

        loadEntities(props = this.props) {
          forEach(finalMapPropsToPromiseProps(props), (promiseProp, propName) => {
            const { method = 'load' } = promiseProp
            if (method === 'load') props[propName]()
          })
        }

        getWrappedInstance() {
          invariant(withRef,
            `To access the wrapped instance, you need to specify ` +
            `{ withRef: true } as the second argument of the connect() call.`
          )

          return this.refs.wrappedInstance
        }
      }

      ApiConnect.displayName = `ApiConnect(${getDisplayName(WrappedComponent)})`
      ApiConnect.WrappedComponent = WrappedComponent
      return hoistStatics(ApiConnect, WrappedComponent)
    }

    const mapStateToProps = (state, ownProps) => {
      invariant(
        !!state.cache,
        'Could not find an API cache in the state (looking at: `state.cache`)'
      )
      const promiseProps = finalMapPropsToPromiseProps(ownProps)
      // keep promise and entity states in separate props, so that react-redux' connect function can
      // figure out whether s.th. has changed
      return {
        ...mapKeys(
          mapValues(
            promiseProps,
            ({ query, type }) => getPromiseState(types, state, type, query)
          ),
          (val, propName) => `${propName}_promise`,
        ),
        ...mapKeys(
          mapValues(
            promiseProps,
            ({ query, type }) => getEntityState(types, state, type, query)
          ),
          (val, propName) => `${propName}_entity`,
        ),
      }

    }

    const actionCreators = actionsCreators(types)
    const mapDispatchToProps = (dispatch, ownProps) => {
      const boundActionCreators = bindActionCreators(actionCreators, dispatch)
      const promiseProps = finalMapPropsToPromiseProps(ownProps)

      const bindActionCreatorForPromiseProp = ({ type, method = 'load', query, requiredFields }) => {
        const actionCreator = boundActionCreators[`${method}Entity`]
        invariant(!!actionCreator,
`Unknown method '${method}' specified
 (supported values: 'fetch', 'create', 'update', 'remove')`
        )
        if (method === 'load') {
          return actionCreator.bind(null, type, query, requiredFields)
        }

        return actionCreator.bind(null, type)
      }

      return mapValues(promiseProps, bindActionCreatorForPromiseProp)
    }

    const mergeProps = (stateProps, dispatchProps, ownProps) => {
      const promiseProps = finalMapPropsToPromiseProps(ownProps)

      const joinPromiseValue = propName => {
        const promise = stateProps[`${propName}_promise`]
        const entity = stateProps[`${propName}_entity`]

        return promise ? {
          ...promise,
          value: entity,
        } : {
          pending: !entity,
          fulfilled: !!entity,
          value: entity,
        }
      }

      const assignPromiseStateToActionCreator = (propName, promiseState) => {
        return Object.assign(dispatchProps[propName], promiseState)
      }

      // now it's time to join the `${propName}_entity` with the `${propName}_promise` props
      return {
        ...ownProps,
        ...mapValues(promiseProps, (value, propName) => assignPromiseStateToActionCreator(
          propName,
          joinPromiseValue(propName)
        )),
        ...dispatchProps,
      }
    }

    return compose(
      reduxConnect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        options
      ),
      wrapWithApiConnect,
    )
  }
}
