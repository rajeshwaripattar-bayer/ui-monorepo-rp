import { FasteStore, FasteStoreProvider } from '@monsantoit/faste-lite-react'
import { Store, UnknownAction } from '@reduxjs/toolkit'
import { isUndefined } from 'lodash'
import React, { useMemo } from 'react'
import { Provider, ProviderProps } from 'react-redux'
import { Context as ResponsiveContext } from 'react-responsive'
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom'
import { setupFasteStore } from './mockFasteStore'
import { buildStore, mergeWithGlobalReducers } from '@gc/redux-store'

export type TestWrapperProps = {
  width?: number
  fasteStore?: FasteStore
  children: React.ReactNode
  memoryRouterProps?: MemoryRouterProps
  providerProps?: Omit<ProviderProps, 'children' | 'store'> & {
    store?: Store<unknown, UnknownAction, unknown>
  }
}

function BaseWrapper({ fasteStore, memoryRouterProps, children, width = 1024 }: Readonly<TestWrapperProps>) {
  const responsiveContextValue = useMemo(() => ({ width }), [width])

  return (
    <FasteStoreProvider store={fasteStore ?? setupFasteStore()}>
      <ResponsiveContext.Provider value={responsiveContextValue}>
        <MemoryRouter {...memoryRouterProps}>{children}</MemoryRouter>
      </ResponsiveContext.Provider>
    </FasteStoreProvider>
  )
}

export function TestWrapper({
  width,
  fasteStore,
  providerProps,
  memoryRouterProps,
  children
}: Readonly<TestWrapperProps>) {
  const wrapperProps = { width, fasteStore, memoryRouterProps }
  const reduxProps = {
    ...providerProps,
    store: providerProps?.store ?? buildStore({ preloadedState: {}, reducer: mergeWithGlobalReducers({}) })
  }

  if (isUndefined(providerProps)) {
    return <BaseWrapper {...wrapperProps}>{children}</BaseWrapper>
  }

  return (
    <Provider {...reduxProps}>
      <BaseWrapper {...wrapperProps}>{children}</BaseWrapper>
    </Provider>
  )
}

export default TestWrapper
