import { mapValues } from 'lodash'

const mergeProps = ({ finalMapPropsToPromiseProps }) => (
  stateProps,
  dispatchProps,
  ownProps
) => {
  const promiseProps = finalMapPropsToPromiseProps(ownProps)

  const joinPromiseValue = (propName) => {
    const promise = stateProps[`${propName}_request`]
    const entity = stateProps[`${propName}_entity`]

    let initialPromise

    if (promiseProps[propName].method === 'fetch') {
      initialPromise = {
        pending: !entity && !promiseProps[propName].lazy,
        fulfilled: !!entity,
      }
    } else {
      initialPromise = {
        pending: false,
        fulfilled: false,
      }
    }

    return {
      ...(promise || initialPromise),
      value: entity,
    }
  }

  const mergePromiseStateToActionCreator = (propName, promiseState) => {
    return Object.assign(
      (...args) => dispatchProps[propName](...args),
      promiseState
    )
  }

  // now it's time to join the `${propName}_entity` with the `${propName}_request` props
  return {
    ...ownProps,
    ...dispatchProps,
    ...mapValues(promiseProps, (value, propName) =>
      mergePromiseStateToActionCreator(propName, joinPromiseValue(propName))
    ),
  }
}

export default mergeProps
