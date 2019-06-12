// @flow
export type EntityCollectionT = {|
  [entityId: string]: any,
|}

export type EntitiesState = {|
  [collection: string]: EntityCollectionT,
|}
