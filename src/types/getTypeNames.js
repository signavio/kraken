// @flow
import { mapValues } from 'lodash'

import { type ApiType, type ApiTypeMap } from '../internalTypes'

const getTypeNames = (types: ApiTypeMap) =>
  mapValues(types, (value: ApiType, name: string) => name)

export default getTypeNames
