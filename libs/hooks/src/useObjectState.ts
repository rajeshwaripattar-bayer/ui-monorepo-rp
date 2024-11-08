import * as React from 'react'

function isPlainObject(value: unknown): value is object {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * This hook is a variant of React's built-in useState hook which allows you to update state using a callback function.
 * The callback function takes the current state as an argument and returns the new state.
 * If the new state is an object, it will be merged with the current state.
 * If the new state is not an object, it will be ignored.
 */
export function useObjectState<T>(initialValue: T) {
  const [state, setState] = React.useState(initialValue)

  const handleUpdate = React.useCallback((arg: unknown) => {
    if (typeof arg === 'function') {
      setState((s) => {
        const newState = arg(s)

        if (isPlainObject(newState)) {
          return {
            ...s,
            ...newState
          }
        }

        return s
      })
    }

    if (isPlainObject(arg)) {
      setState((s) => ({
        ...s,
        ...arg
      }))
    }
  }, [])

  return [state, handleUpdate] as const
}
