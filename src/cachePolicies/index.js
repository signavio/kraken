import optimisticRemove from './optimisticRemove'
import queryFromCache from './queryFromCache'
import removeReferencesToDeletedEntities from './removeReferencesToDeletedEntities'

export { default as compose } from './compose'

export { default as getCachePolicy } from './getCachePolicy'

export const cachePolicies = {
  optimisticRemove,
  queryFromCache,
  removeReferencesToDeletedEntities,
}
