// @flow
import { schema } from 'normalizr'

import { type Action } from './actions'
import { type EntitiesState, type EntityCollectionT } from './entityState'

export type normalizrResult =
  | { response: { result: string | Array<string>, entities: EntitiesState } }
  | { error: any }

type ApiRequest = (
  query: any,
  body: any,
  requestParams: any
) => Promise<normalizrResult>

type RequestOptions = {|
  method: 'PUT' | 'POST' | 'GET' | 'DELETE',
  body?: mixed,
|}

export type CallApi = (
  url: string,
  schema: schema.Array | schema.Entity,
  options?: RequestOptions
) => Promise<normalizrResult>

type ApiCreator = (callApi: CallApi, apiBase: string) => ApiRequest

export type ApiType = {|
  collection: string,
  schema: schema.Entity | schema.Array,

  cachePolicy?: {
    updateRequestOnCollectionChange?: (
      apiTypes: { [string]: ApiType },
      request: Request,
      collection: EntityCollectionT,
      entityType: string
    ) => Request,
    updateEntitiesOnAction?: (
      apiTypes: { [string]: ApiType },
      entities: EntitiesState,
      action: Action
    ) => EntitiesState,
  },

  fetch?: ApiCreator,
  create?: ApiCreator,
  remove?: ApiCreator,
  update?: ApiCreator,
|}
