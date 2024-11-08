import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import type { ContingencyProps } from '@gc/types'
import { setContingency } from '../slices/appSlice'
import type { TypedUseMutation } from '@reduxjs/toolkit/query/react'

type Resolve<DataType> = { isSuccess: boolean; data: DataType | undefined }
// When dispatch & contingency are provided, this hook will handle API failure and set appropriate contingency in state. Otherwise it will call onError function (if provided). At last if none of these options are provided, API error will be thrown as an exception and need to be handled where API call was trigged!!
type OptionsType = {
  onError?: () => void //TODO - onError might not be useful as we are returning exception
  onRetry?: () => void
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
  contingency?: ContingencyProps
}
type Payload<Q> = {
  queryArgs: Q
  options: OptionsType | undefined
}

const useMutationWithRetry = <Q, R>(useMutation: TypedUseMutation<R, Q, BaseQueryFn>) => {
  const [mutation, result] = useMutation()
  const resolveRef = useRef<(value: Resolve<R>) => void>()
  const [response, setResponse] = useState<Resolve<R>>()
  const [payload, setPayload] = useState<Payload<Q> | null>(null)
  const payloadRef = useRef<Payload<Q> | null>()
  payloadRef.current = payload

  const [resultPromise, setResultPromise] = useState<Promise<Resolve<R>>>()
  useEffect(() => {
    if (response && resolveRef.current) {
      resolveRef.current(response)
      setResultPromise(undefined)
      resolveRef.current = undefined
    }
  }, [response])

  const attempt = useCallback(
    async (queryArgs: Q, options?: OptionsType): Promise<Resolve<R> | undefined> => {
      setPayload({ queryArgs, options })

      const { contingency, dispatch, onError } = options || {}
      const canHandleApiFailure = (contingency && dispatch) || onError

      let _resultPromise = resultPromise
      if (!resolveRef.current) {
        _resultPromise = new Promise<Resolve<R>>((resolve) => {
          resolveRef.current = resolve
        })
        setResultPromise(_resultPromise)
      }

      let error: unknown

      try {
        const res = await mutation(queryArgs).unwrap()
        setResponse({ data: res, isSuccess: true })
      } catch (e: unknown) {
        error = e
        if (canHandleApiFailure) {
          const { contingency, dispatch, onError } = options || {}
          if (contingency && dispatch) {
            dispatch(setContingency(contingency))
          }
          !!onError && onError()
        }
      }
      if (!canHandleApiFailure && error) {
        throw error
      }
      return _resultPromise
    },
    [mutation, resultPromise]
  )

  const retry = useCallback(async (): Promise<Resolve<R> | undefined> => {
    const _payload = payloadRef.current
    if (_payload) {
      const { onRetry, dispatch } = _payload.options || {}
      !!dispatch && dispatch(setContingency())
      !!onRetry && onRetry()
      return await attempt(_payload.queryArgs, _payload.options)
    }

    return new Promise((resolve) => resolve({ data: undefined, isSuccess: false }))
  }, [attempt])

  const cancel = useCallback(() => {
    resolveRef.current?.({ data: undefined, isSuccess: false })
    resolveRef.current = undefined
  }, [])

  const wrapped = useCallback(
    () =>
      [attempt, { ...result, retry, cancel }] as [
        (queryArgs: Q, options?: OptionsType) => Promise<Resolve<R>>,
        a: { retry: () => Promise<Resolve<R>>; cancel: () => void } & typeof result
      ],
    [attempt, result, retry, cancel]
  )
  return wrapped
}

export default useMutationWithRetry
