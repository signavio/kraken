import invariant from 'invariant'

import mapValues from 'lodash/fp/mapValues'

import { VALID_METHODS } from './constants'

const validatePromiseProps = ({ types }) => mapValues((props) => {
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

  invariant(!(id && query), "Must only define one of the 'id' and 'query' parameters")

  return props
})

export default validatePromiseProps
