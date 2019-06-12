// @flow
import { schema } from 'normalizr'

import { type EntitiesState } from './entityState'

export type Query = {
  [key: string]: void | string | number | boolean,
}

export type normalizrResult =
  | { response: { result: string | Array<string>, entities: EntitiesState } }
  | { error: any }

type ApiRequest = (
  query?: Query,
  body?: any,
  requestParams?: Query
) => Promise<normalizrResult>

export type ApiType = {|
  collection: string,
  schema: schema.Entity | schema.Array,

  fetch?: ApiRequest,
  create?: ApiRequest,
  remove?: ApiRequest,
  update?: ApiRequest,
|}

export type ApiTypeMap = {
  [name: string]: ApiType,
}
