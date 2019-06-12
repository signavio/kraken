// @flow
import { mapValues } from 'lodash'

import { type ApiType, type ApiTypeMap } from '../flowTypes'

const getTypeNames = (types: ApiTypeMap) =>
  mapValues(types, (value: ApiType, name: string) => name)

export default getTypeNames
