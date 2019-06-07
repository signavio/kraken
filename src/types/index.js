import createMethodFunctionGetter from './createMethodFunctionGetter'

export { default as getCollectionName } from './getCollectionName'
export { default as hasEntitySchema } from './hasEntitySchema'
export { default as getIdAttribute } from './getIdAttribute'
export { default as getTypeNames } from './getTypeNames'

export const getFetch = createMethodFunctionGetter('fetch')
export const getCreate = createMethodFunctionGetter('create')
export const getUpdate = createMethodFunctionGetter('update')
export const getRemove = createMethodFunctionGetter('remove')
