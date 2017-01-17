import { mapValues } from 'lodash/fp'

import { getIdAttribute } from '../../types'

const mapIdToQuery = (types) => mapValues((props) => {
  const { id, query, type, ...rest } = props

  if (id && !query) {
    return {
      query: { [getIdAttribute(types, type)]: id },
      type,
      ...rest,
    }
  }

  return props
})

export default mapIdToQuery
