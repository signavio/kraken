// @flow
import { isString } from 'lodash'

import { ApiTypeMap, EntityType } from '../internalTypes'

const getCollectionName = (types: ApiTypeMap, entityType: EntityType) => {
  const collection = types[entityType].collection

  if (!isString(collection)) {
    throw new Error(`collection of type: '${entityType}' must be a string`)
  }

  return collection
}

export default getCollectionName
