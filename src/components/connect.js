import { Component, createElement, PropTypes } from 'react'
import { connect as reduxConnect } from 'react-redux'
import invariant from 'invariant'
import hoistStatics from 'hoist-non-react-statics'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import mapKeys from 'lodash/mapKeys'

import fpMapValues from 'lodash/fp/mapValues'
import compose from 'lodash/fp/compose'
import pickBy from 'lodash/fp/pickBy'

import actionsCreator from '../actions'
import { getPromiseState, getEntityState } from '../utils'
import { getIdAttribute } from '../types'


function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

const mapIdToQuery = (types) => fpMapValues(({ id, query, type, ...rest }) => {
  invariant(!(id && query), `Must only define one of the 'id' and 'query' parameters`)
  if (id) {
    query = { [getIdAttribute(types, type)]: id }
  }
  if (!query) {
    query = {}
  }
  return { query, type, ...rest }
})

export default (types) => {
  return (mapPropsToPromiseProps = () => ({}), options = {}) => {
    const { withRef = false } = options

    mapPropsToPromiseProps = compose(mapIdToQuery(types), pickBy(Boolean), mapPropsToPromiseProps)

    const wrapWithApiConnect = (WrappedComponent) => {
      class ApiConnect extends Component {

        static propTypes = {
          loadEntity: PropTypes.func.isRequired,
        }

        componentWillMount() {
          this.loadEntities(this.props)
        }

        render() {
          const { loadEntity, ...props } = this.props
          return createElement(
            WrappedComponent, {
              ...props,
              ...(withRef ? { ref: 'wrappedInstance' } : {}),
            }
          )
        }

        loadEntities(props = this.props) {
          const { loadEntity, ...rest } = props
          forEach(mapPropsToPromiseProps(rest),
            ({ type, query, requiredFields }) => loadEntity(type, query, requiredFields)
          )
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

    const mapStateToProps = (state, props) => {
      invariant(
        !!state.cache,
        'Could not find an API cache in the state (looking at: `state.cache`)'
      )
      const promiseProps = mapPropsToPromiseProps(props)
      // keep promise and entity states in separate props, so that react-redux' connect function can
      // figure out whether s.th. has changed
      return {
        ...mapKeys(
          mapValues(
            promiseProps,
            ({ query, type }) => getPromiseState(state, type, query, types)
          ),
          (val, propName) => `${propName}_promise`,
        ),
        ...mapKeys(
          mapValues(
            promiseProps,
            ({ query, type }) => getEntityState(state, type, query, types)
          ),
          (val, propName) => `${propName}_entity`,
        ),
      }

    }

    const mergeProps = (stateProps, dispatchProps, ownProps) => {
      const promiseProps = mapPropsToPromiseProps(ownProps)
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

      // now it's time to join the `${propName}_entity` with the `${propName}_promise` props
      return {
        ...ownProps,
        ...mapValues(promiseProps, (value, propName) => joinPromiseValue(propName)),
        ...dispatchProps,
      }
    }


    const { loadEntity, createEntity, updateEntity, deleteEntity } = actionsCreator(types)
    return compose(
      reduxConnect(mapStateToProps, { loadEntity, createEntity, updateEntity, deleteEntity }, mergeProps, options),
      wrapWithApiConnect,
    )
  }
}
