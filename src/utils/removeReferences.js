// @flow
import { schema as normalizrSchema } from 'normalizr'
import { uniq, keys, difference } from 'lodash'

import type { Entity } from '../internalTypes'

import isArraySchemaOf from './isArraySchemaOf'

const getEntitySchema = (entityOrArraySchema: Object): Entity => {
  if (entityOrArraySchema instanceof normalizrSchema.Array) {
    return entityOrArraySchema.schema
  }

  if (Array.isArray(entityOrArraySchema) && entityOrArraySchema.length === 1) {
    return entityOrArraySchema[0]
  }

  return entityOrArraySchema
}

export default function removeReferences(
  entityState: Entity,
  responsibleSchemas: Array<Object>,
  schemaOfItemsToRemove: Object,
  idsToRemove: Array<string>
): Entity {
  const entitySchemaOfItemsToRemove = getEntitySchema(schemaOfItemsToRemove)

  return uniq(responsibleSchemas.map(getEntitySchema)).reduce(
    (previousEntityState: Entity, schema: Object) => {
      const nextEntityState = { ...previousEntityState }
      let changed = false

      keys(schema.schema).forEach((fieldName: string) => {
        if (schema.schema[fieldName] === entitySchemaOfItemsToRemove) {
          if (idsToRemove.indexOf(entityState[fieldName]) >= 0) {
            delete nextEntityState[fieldName]
            changed = true
          }
        }

        if (
          isArraySchemaOf(schema.schema[fieldName], entitySchemaOfItemsToRemove)
        ) {
          nextEntityState[fieldName] = difference(
            nextEntityState[fieldName],
            idsToRemove
          )
          changed = true
        }
      })

      return changed ? nextEntityState : previousEntityState
    },
    entityState
  )
}
