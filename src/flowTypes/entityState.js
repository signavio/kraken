// @flow
export type EntityCollectionT<Value> = {|
  [entityId: string]: Value,
|}

export type EntitiesState<Value> = {|
  [collection: string]: EntityCollectionT<Value>,
|}
