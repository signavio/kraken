This module provides access to all entities that are part of the (not yet) Public Effektif API:

- users
- files
- emails
- cases
- workflows

It exports a reducer which consuming apps should hook into their root reducer / a store enhancer to enable local caching.

It exports a `load` enhancer function, that can be used in components needing access to entity objects:

```es6
class UserEditField extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    userFetch: PropTypes.instanceOf(PromiseState).isRequired
  }

  render() {
    const { userFetch } = this.props

    // render the different promise states
    if (userFetch.pending) {
      return <LoadingAnimation/>
    } else if (userFetch.rejected) {
      return <Error error={userFetch.reason}/>
    } else if (userFetch.fulfilled) {
      const user = userFetch.value
      return (
        <div>
          ...
        </div>
      )
    }
  }
}
export default load(props => ({
    userFetch: {
        type: USER,
        id: props.value,
        requiredFields: [ 'firstName', 'lastName', 'color' ]
    }
}))(UserEditField)
```
