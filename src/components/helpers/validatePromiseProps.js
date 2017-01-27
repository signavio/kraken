import invariant from 'invariant'

import { includes } from 'lodash'
import { mapValues } from 'lodash/fp'

import { validMethods } from './constants'

const validatePromiseProps = ({ types }) => mapValues((props) => {
  const { type, method, id, query } = props

  invariant(
    type && types[type],
    `Invalid type value '${type}' passed to \`connect\` ` +
    `(expected one of: ${Object.keys(types).join(', ')})`
  )

  invariant(
    includes(validMethods, method),
    `Invalid method '${method}' specified for \`connect\` ` +
    `(expected one of: ${validMethods.join(', ')})`
  )

  invariant(!(id && query), 'Must only define one of the \'id\' and \'query\' parameters')

  return props
})

export default validatePromiseProps
