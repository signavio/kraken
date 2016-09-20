import { connect as reduxConnect } from 'react-redux'

import isFunction from 'lodash/isFunction'

import fpMapValues from 'lodash/fp/mapValues'
import compose from 'lodash/fp/compose'
import pickBy from 'lodash/fp/pickBy'


import {
  injectElementIdProp,
  wrapWithApiConnect,
  mapStateToProps,
  mapDispatchToPropsFactory,
  mergeProps,
  validatePromiseProps,
  mapIdToQuery,
} from './helpers'

const makeFetchTheDefaultMethod = fpMapValues((props) => (
  props.method ? props : { ...props, method: 'fetch' }
))

const objectShorthandToFunction = (mapPropsToPromiseProps) => (
  isFunction(mapPropsToPromiseProps) ?
    mapPropsToPromiseProps :
    () => mapPropsToPromiseProps
)

export default (types) =>
  (mapPropsToPromiseProps = () => ({}), options = {}) => {
    const { withRef = false } = options

    // filter out empty promise prop mappings and
    // transform shortcut id query syntax into regular queries
    const finalMapPropsToPromiseProps = compose(
      mapIdToQuery(types),
      validatePromiseProps({ types }),
      makeFetchTheDefaultMethod,
      pickBy(Boolean), // remove falsy values
      objectShorthandToFunction(mapPropsToPromiseProps)
    )

    return compose(
      injectElementIdProp({ withRef }),
      reduxConnect(
        mapStateToProps({ types, finalMapPropsToPromiseProps }),
        mapDispatchToPropsFactory({ types, finalMapPropsToPromiseProps }),
        mergeProps({ finalMapPropsToPromiseProps }),
        options
      ),
      wrapWithApiConnect({ finalMapPropsToPromiseProps, withRef }),
    )
  }
