// @flow
import { schema } from 'normalizr'

export default function isArraySchemaOf(
  arraySchema: Object,
  itemSchema: Object
): boolean {
  if (arraySchema instanceof schema.Array) {
    return arraySchema.schema === itemSchema
  }

  if (Array.isArray(arraySchema) && arraySchema.length === 1) {
    return arraySchema[0] === itemSchema
  }

  return false
}
