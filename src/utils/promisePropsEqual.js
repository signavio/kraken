import { isPlainObject, isEqual, omit } from 'lodash'

const queriesAreEqual = ({ query: queryA }, { query: queryB }) => {
  if (queryA === queryB) {
    return true
  }

  if (!isPlainObject(queryA) || !isPlainObject(queryB)) {
    return false
  }

  return isEqual(queryA, queryB)
}

const fieldsAreEqual = ({ requiredFields: fieldsA }, { requiredFields: fieldsB }) => {
  if (fieldsA === fieldsB) {
    return true
  }

  return isEqual(fieldsA, fieldsB)
}

export default (leftProps, rightProps) => (
  queriesAreEqual(leftProps, rightProps) &&
  fieldsAreEqual(leftProps, rightProps) &&
  isEqual(
    omit(leftProps, 'query', 'requiredFields'),
    omit(rightProps, 'query', 'requiredFields'),
  )
)
