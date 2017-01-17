import { compact, flatten } from 'lodash'

export const all = (...promises) => {
  promises = compact(flatten(promises))

  return {
    pending: promises.some((ps) => ps.pending),
    refreshing: promises.some((ps) => ps.refreshing),
    fulfilled: promises.every((ps) => ps.fulfilled),
    rejected: promises.some((ps) => ps.rejected),
    value: promises.map((ps) => ps.value),
    reason: (promises.find((ps) => ps.reason) || {}).reason,
    meta: promises.map((ps) => ps.meta),
  }
}

export const race = (...promises) => {
  promises = compact(flatten(promises))
  const winner = promises.find((ps) => ps.fulfilled || ps.rejected)

  return {
    pending: !winner && promises.some((ps) => ps.pending),
    refreshing: !winner && promises.some((ps) => ps.refreshing),
    fulfilled: winner && winner.fulfilled,
    rejected: winner && winner.rejected,
    value: winner && winner.value,
    reason: winner && winner.reason,
    meta: winner && winner.meta,
  }
}
