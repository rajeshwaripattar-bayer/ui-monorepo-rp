import { DependencyList, useRef } from 'react'
import isEqual from 'react-fast-compare'

export function useCreation<T>(factory: () => T, deps: DependencyList) {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false
  })

  if (current.initialized === false || !isEqual(current.deps, deps)) {
    current.deps = deps
    current.obj = factory()
    current.initialized = true
  }

  return current.obj as T
}
