// @flow
import { schema } from 'normalizr'

import { type Action } from './actions'
import { type EntitiesState, type EntityCollectionT } from './entityState'
import { type Query } from './requestState'

export type normalizrResult =
  | {
      response: {
        result: string | Array<string>,
        entities: EntitiesState<mixed>,
      },
    }
  | { error: any }

type ApiRequest = (
  query?: Query,
  body?: mixed,
  requestParams?: Query
) => Promise<normalizrResult>

export type ApiTypeMap = {
  [name: string]: {|
    collection: string,
    schema: schema.Entity | schema.Array,

    cachePolicy?: {
      updateRequestOnCollectionChange?: (
        apiTypes: ApiTypeMap,
        request: Request,
        collection: EntityCollectionT<mixed>,
        entityType: string
      ) => ApiRequest,
      updateEntitiesOnAction?: (
        apiTypes: ApiTypeMap,
        entities: EntitiesState<mixed>,
        action: Action
      ) => EntitiesState<mixed>,
    },

    fetch?: ApiRequest,
    create?: ApiRequest,
    remove?: ApiRequest,
    update?: ApiRequest,
  |},
}

export type ApiType = $Values<ApiTypeMap>
