import { Dispatch, SetStateAction, useRef, useState } from 'react'
import isFunction from 'lodash/isFunction'
import useMemoizedFn from './useMemoizedFn'
import { useCreation } from './useCreation'

type ResetState = () => void

export const useResetState = <S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>, ResetState] => {
  const initialStateRef = useRef(initialState)
  const initialStateMemo = useCreation(
    () => (isFunction(initialStateRef.current) ? initialStateRef.current() : initialStateRef.current),
    []
  )

  const [state, setState] = useState(initialStateMemo)
  const resetState = useMemoizedFn(() => {
    setState(initialStateMemo)
  })

  return [state, setState, resetState]
}
