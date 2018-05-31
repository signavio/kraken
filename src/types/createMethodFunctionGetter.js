// @flow
import { isFunction } from 'lodash'

import { ApiTypeMap, MethodName, EntityType } from '../internalTypes'

const createMethodFunctionGetter = (methodName: MethodName) => (
  types: ApiTypeMap,
  entityType: EntityType
) => {
  const method = types[entityType][methodName]

  if (!isFunction(method)) {
    throw new Error(
      `Implementation of '${entityType}' type does not provide a ${methodName} function.`
    )
  }

  return method
}

export default createMethodFunctionGetter
