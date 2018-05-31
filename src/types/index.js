import createMethodFunctionGetter from './createMethodFunctionGetter'

export getCollectionName from './getCollectionName'
export hasEntitySchema from './hasEntitySchema'
export getCachePolicy from './getCachePolicy'
export getIdAttribute from './getIdAttribute'
export getTypeNames from './getTypeNames'

export const getFetch = createMethodFunctionGetter('fetch')
export const getCreate = createMethodFunctionGetter('create')
export const getUpdate = createMethodFunctionGetter('update')
export const getRemove = createMethodFunctionGetter('remove')
