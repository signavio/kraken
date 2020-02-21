import invariant from 'invariant'
import { isArray, mapKeys, mapValues } from 'lodash'
import { shallowEqual } from 'react-redux'

import { getEntityState, getRequestId, getRequestState } from '../../utils'
import { ELEMENT_ID_PROP_NAME } from './constants'

const mapStateToProps = ({ types, finalMapPropsToPromiseProps }) => () => {
  let lastStateProps = {}

  return (state, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
    invariant(
      !!state.kraken,
      'Could not find an API cache in the state (looking at: `state.kraken`)'
    )
    const promiseProps = finalMapPropsToPromiseProps(ownProps)
    // keep promise and entity states in separate props, so that react-redux' connect
    // function can figure out whether s.th. has changed
    const stateProps = {
      ...mapKeys(
        mapValues(
          promiseProps,
          ({ query, requestParams, type, method }, propName) =>
            getRequestState(
              state.kraken,
              type,
              getRequestId(method, query, requestParams, elementId)
            )
        ),
        (val, propName) => `${propName}_request`
      ),
      ...mapKeys(
        mapValues(
          promiseProps,
          (
            { query, requestParams, refresh, type, method, denormalize },
            propName
          ) => {
            const entityState = getEntityState(
              types,
              state.kraken,
              type,
              getRequestId(method, query, requestParams, elementId),
              denormalize
            )

            const lastEntityState = lastStateProps[`${propName}_entity`]
            const useMemoized =
              isArray(entityState) &&
              lastEntityState &&
              shallowEqual(entityState, lastEntityState)

            return useMemoized ? lastEntityState : entityState
          }
        ),
        (val, propName) => `${propName}_entity`
      ),
    }
    lastStateProps = stateProps
    return stateProps
  }
}

export default mapStateToProps
