// @flow
import { useSelector } from 'react-redux'

import { type KrakenState, type MetaData } from '../flowTypes'

type State = {|
  kraken: KrakenState,
|}

function useApiBase(): string {
  const metaData = useSelector<State, MetaData>(({ kraken }) => kraken.metaData)

  return metaData.apiBase
}

export default useApiBase
