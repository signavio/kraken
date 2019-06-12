import { mapValues } from 'lodash/fp'

import { ApiTypeMap } from '../../flowTypes'

import { getIdAttribute } from '../../types'

const mapIdToQuery = (types: ApiTypeMap) => mapValues((props) => {
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
