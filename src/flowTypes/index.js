export type PromiseStateT<T> = {
  outstanding: boolean,
  refresh: boolean,

  value: T,
};

type PromiseCacheT = {
  [key: string]: PromiseStateT,
};

export type EntityStateT<T> = {
  [id: string]: T,
};

export type EntityCollectionT<T> = {
  [collection: string]: EntityStateT<T>,
};

type CacheT<T> = {
  promises: PromiseCacheT<T>,
  entities: EntityCollectionT<T>,
};

export type StateT = {
  cache: CacheT,
};

type ApiTypeT = {
  collection: string,

  fetch?: (any) => void,
  create?: (any) => void,
  remove?: (any) => void,
  update?: (any) => void,
};

export type ApiTypesT = {
  [name: string]: ApiTypeT,
};

export type MethodT = 'create' | 'fetch' | 'remove' | 'update';

export type PayloadT = {
  query: JSON,

  refresh: boolean,

  elementId: string,
  propName: string,
};
