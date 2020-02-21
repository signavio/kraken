// @flow
import invariant from 'invariant'
import { useSelector } from 'react-redux'

const useKrakenState = () => {
  const krakenState = useSelector(({ kraken }) => kraken)

  invariant(
    krakenState,
    'Could not find an API cache in the state (looking at: `state.kraken`)'
  )

  return krakenState
}

export default useKrakenState
