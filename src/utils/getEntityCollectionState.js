import { getCollection } from '../types'

export default (types, state, type) => (
  state.cache.entities[getCollection(types, type)]
)
