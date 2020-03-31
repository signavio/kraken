// @flow
import { useSelector } from 'react-redux'

import { type MetaData, type State } from '../flowTypes'

function useApiBase(): string {
  const metaData = useSelector<State, MetaData>(({ kraken }) => kraken.metaData)

  return metaData.apiBase
}

export default useApiBase
