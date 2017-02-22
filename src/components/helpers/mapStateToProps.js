import shallowEqual from 'react-redux/lib/utils/shallowEqual'
import invariant from 'invariant'

import { mapValues, mapKeys, isArray } from 'lodash'

import { getRequestState, getEntityState } from '../../utils'
import { actionTypes } from '../../actions'

import { ELEMENT_ID_PROP_NAME } from './constants'

const mapStateToProps = ({
  types,
  finalMapPropsToPromiseProps,
}) => () => {
  let lastStateProps = {}

  return (state, { [ELEMENT_ID_PROP_NAME]: elementId, ...ownProps }) => {
    invariant(
      !!state.genericApi,
      'Could not find an API cache in the state (looking at: `state.genericApi`)'
    )
    const promiseProps = finalMapPropsToPromiseProps(ownProps)
    // keep promise and entity states in separate props, so that react-redux' connect
    // function can figure out whether s.th. has changed
    const stateProps = {
      ...mapKeys(
        mapValues(
          promiseProps,
          ({ query, type, method }, propName) => getRequestState(
            types,
            state,
            {
              type: actionTypes[`${method.toUpperCase()}_DISPATCH`],
              payload: {
                entityType: type,
                query,
                elementId,
                propName,
              },
            }
          )
        ),
        (val, propName) => `${propName}_request`,
      ),
      ...mapKeys(
        mapValues(
          promiseProps,
          ({ query, refresh, type, method }, propName) => {
            const entityState = getEntityState(
              types,
              state,
              {
                type: actionTypes[`${method.toUpperCase()}_DISPATCH`],
                payload: {
                  entityType: type,
                  query,
                  refresh,
                  elementId,
                },
              },
            )

            const lastEntityState = lastStateProps[`${propName}_entity`]
            const useMemoized = (
              isArray(entityState) &&
              lastEntityState &&
              shallowEqual(entityState, lastEntityState)
            )

            return useMemoized ? lastEntityState : entityState
          }
        ),
        (val, propName) => `${propName}_entity`,
      ),
    }
    lastStateProps = stateProps
    return stateProps
  }
}

export default mapStateToProps
