import React, { ReactElement } from 'react'
// keep unused queries import to enable transitive type discovery from remote module federated applications
import { render, RenderOptions, act, waitFor } from '@testing-library/react'
import { Context as ResponsiveContext } from 'react-responsive'
import { Provider } from 'react-redux'
import type { SetupServerApi } from 'msw/node'
import { Store, UnknownAction } from '@reduxjs/toolkit'

// import { TranslationProvider } from 'my-i18n-lib'
// import defaultStrings from 'i18n/en-x-default'
interface ExtRenderOptions extends RenderOptions {
  width?: number
  store?: Store<unknown, UnknownAction, unknown>
}

const getWrapper =
  (width = 1024, store?: Store<unknown, UnknownAction, unknown>) =>
  ({ children }: { children: React.ReactNode }) => {
    if (store) {
      return (
        <Provider store={store}>
          <ResponsiveContext.Provider value={{ width }}>{children}</ResponsiveContext.Provider>
        </Provider>
      )
    } else {
      return <ResponsiveContext.Provider value={{ width }}>{children}</ResponsiveContext.Provider>
    }
  }

const customRender = (ui: ReactElement, options?: Omit<ExtRenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: getWrapper(options?.width, options?.store), ...options })

const actAwait = async (timeout = 10) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, timeout))
  })
}

type events = { [key: string]: { url: string; body: object | null }[] }

const trackMockedServices = (server: SetupServerApi): (() => events) => {
  const events: events = {}
  server.events.on('response:mocked', async ({ request }) => {
    let body = null
    if (request.method === 'POST' || request.method === 'PUT') {
      body = JSON.parse((await request.clone().text()) || '{}')
    }

    events[request.method] = [...(events[request.method] || []), { url: request.url, body }]
  })
  return () => events
}

export * from '@testing-library/react'
export { customRender as render, actAwait, trackMockedServices, waitFor }
