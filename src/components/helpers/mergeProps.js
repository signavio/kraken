import { mapValues } from 'lodash'

const mergeProps = ({ finalMapPropsToPromiseProps }) => (stateProps, dispatchProps, ownProps) => {
  const promiseProps = finalMapPropsToPromiseProps(ownProps)

  const joinPromiseValue = (propName) => {
    const promise = stateProps[`${propName}_promise`]
    const entity = stateProps[`${propName}_entity`]

    const initialPromise = promiseProps[propName].method === 'fetch'
      ? {
        pending: !entity,
        fulfilled: !!entity,
      } : {
        pending: false,
        fulfilled: false,
      }

    return {
      ...(promise || initialPromise),
      value: entity,
    }
  }

  const mergePromiseStateToActionCreator = (propName, promiseState) =>
    Object.assign((...args) => dispatchProps[propName](...args), promiseState)

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

export default mergeProps
