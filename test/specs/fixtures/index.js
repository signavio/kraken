import { mapValues } from 'lodash'
import apiTypes from './types'

export apiTypes from './types'
export * as data from './data'

export const types = mapValues(apiTypes, (def, key) => key)
