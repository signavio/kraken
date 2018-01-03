import { schema } from 'normalizr'

import isArraySchemaOf from '../../../src/utils/isArraySchemaOf'
import expect from '../../expect'

describe('isArraySchemaOf', () => {
  it('should match array and item schemas', () => {
    const itemSchema = new schema.Entity('posts')
    const arraySchema = new schema.Array(itemSchema)

    expect(isArraySchemaOf(arraySchema, itemSchema)).to.be.true
  })

  it('should match array and item schemas (shortcut syntax)', () => {
    const itemSchema = new schema.Entity('posts')
    const arraySchema = [itemSchema]

    expect(isArraySchemaOf(arraySchema, itemSchema)).to.be.true
  })

  it('should not match array schema with different type', () => {
    const otherSchema = new schema.Entity('comments')

    const itemSchema = new schema.Entity('posts')
    const arraySchema = [itemSchema]

    expect(isArraySchemaOf(arraySchema, otherSchema)).to.be.false
  })
})
