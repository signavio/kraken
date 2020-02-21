// @flow
import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'

function useMemoized<Value>(value: Value): Value {
  const [memoizedValue, setMemoizedValue] = useState(value)

  useEffect(() => {
    if (!shallowEqual(memoizedValue, value)) {
      setMemoizedValue(value)
    }
  }, [memoizedValue, value])

  return memoizedValue
}

export default useMemoized
