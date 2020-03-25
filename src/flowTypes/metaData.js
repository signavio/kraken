// @flow

type Headers = {|
  [header: string]: ?string,
|}

export type MetaData = {|
  headers?: Headers,
  credentials?: string,
|}
