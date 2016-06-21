import { Component, createElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import invariant from 'invariant'
import hoistStatics from 'hoist-non-react-statics'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import mapKeys from 'lodash/mapKeys'
import isFunction from 'lodash/isFunction'

import fpMapValues from 'lodash/fp/mapValues'
import compose from 'lodash/fp/compose'
import pickBy from 'lodash/fp/pickBy'
import uniqueId from 'lodash/uniqueId'

import actionsCreators from '../actions'
import { getPromiseState, getEntityState, deriveRequestId } from '../utils'
import { getIdAttribute } from '../types'


function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

const VALID_METHODS = ['fetch', 'create', 'update', 'remove']
const ELEMENT_ID_PROP_NAME = '__api__elementId'

const validatePromiseProps = (types) => fpMapValues((props) => {
  const { type, method, id, query } = props

  invariant(
    type && types[type],
    `Invalid type value '${type}' passed to \`connect\` ` +
    `(expected one of: ${Object.keys(types).join(', ')})`
  )

  invariant(
    VALID_METHODS.indexOf(method) >= 0,
    `Invalid method '${method}' specified for \`connect\` ` +
    `(expected one of: ${VALID_METHODS.join(', ')})`
  )

  invariant(!(id && query), `Must only define one of the 'id' and 'query' parameters`)

  return props
})

const makeFetchTheDefaultMethod = fpMapValues((props) => (
  props.method ? props : { ...props, method: 'fetch' }
))

const objectShorthandToFunction = (mapPropsToPromiseProps) => (
  isFunction(mapPropsToPromiseProps) ?
    mapPropsToPromiseProps :
    () => mapPropsToPromiseProps
)

const mapIdToQuery = (types) => fpMapValues((props) => {
  const { id, query, type, ...rest } = props

  if (id && !query) {
    return {
      query: { [getIdAttribute(types, type)]: id },
      type,
      ...rest,
    }
  }

  return props
})

export default (types) => {
  const actionCreators = actionsCreators(types)

  return (mapPropsToPromiseProps = () => ({}), options = {}) => {
    const { withRef = false } = options

    // filter out empty promise prop mappings and
    // transform shortcut id query syntax into regular queries
    const finalMapPropsToPromiseProps = compose(
      mapIdToQuery(types),
      validatePromiseProps(types),
      makeFetchTheDefaultMethod,
      pickBy(Boolean), // remove falsy values
      objectShorthandToFunction(mapPropsToPromiseProps)
    )

    const injectElementIdProp = (WrappedComponent) => {
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
            `To access the wrapped instance, you need to specify ` +
            `{ withRef: true } as the second argument of the connect() call.`
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
            const { method } = promiseProp
            if (method === 'fetch') props[propName]()
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

    const mapStateToProps = (state, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
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
            ({ query, type, method }, propName) => (
              getPromiseState(types, state, type, method, { query, elementId, propName })
            )
          ),
          (val, propName) => `${propName}_promise`,
        ),
        ...mapKeys(
          mapValues(
            promiseProps,
            ({ query, type, method }, propName) => (
              getEntityState(types, state, type, method, { query, elementId, propName })
            )
          ),
          (val, propName) => `${propName}_entity`,
        ),
      }

    }

    const mapDispatchToProps = (dispatch, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
      const boundActionCreators = bindActionCreators(actionCreators, dispatch)
      const promiseProps = finalMapPropsToPromiseProps(ownProps)

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
            return actionCreator.bind(null, type, deriveRequestId(method, { elementId, propName }))
          default:
            return actionCreator.bind(null, type, query)
        }
      }

      return mapValues(promiseProps, bindActionCreatorForPromiseProp)
    }

    const mergeProps = (stateProps, dispatchProps, ownProps) => {
      const promiseProps = finalMapPropsToPromiseProps(ownProps)

      const joinPromiseValue = propName => {
        const promise = stateProps[`${propName}_promise`]
        const entity = stateProps[`${propName}_entity`]

        const initialPromise = promiseProps[propName].method === 'fetch' ?
          {
            pending: !entity,
            fulfilled: !!entity,
          } :
          {
            pending: false,
            fulfilled: false,
          }

        return {
          ...(promise || initialPromise),
          value: entity,
        }
      }

      const mergePromiseStateToActionCreator = (propName, promiseState) => {
        return Object.assign((...args) => dispatchProps[propName](...args), promiseState)
      }

      // now it's time to join the `${propName}_entity` with the `${propName}_promise` props
      return {
        ...ownProps,
        ...dispatchProps,
        ...mapValues(promiseProps, (value, propName) => mergePromiseStateToActionCreator(
          propName,
          joinPromiseValue(propName)
        )),
      }
    }

    return compose(
      injectElementIdProp,
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
