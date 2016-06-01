
import mapValues from 'lodash/mapValues'

import * as apiTypes from './api'

const types = mapValues(apiTypes, (def, key) => key)

export {
  apiTypes,
}

export default types
