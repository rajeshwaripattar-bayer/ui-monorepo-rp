import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import type { FasteModule, FasteStore } from '@monsantoit/faste-lite-react'
import { FasteStoreProvider } from '@monsantoit/faste-lite-react'
import { setFasteStore } from '@gc/utils'
import ModuleLoader from '@supernova/faste-module-loader'

let root: ReactDOM.Root | null

type TinitAppProps = {
  route: { path: string }
  fasteStore: FasteStore
}

export const getFasteModule = (initApp: (initAppProps: TinitAppProps) => React.ReactElement): FasteModule => {
  return {
    name: 'React Faste',
    mount: async (elementID, moduleProps) => {
      const { route, fasteStore } = moduleProps ?? {}

      ModuleLoader.init(moduleProps)
      setFasteStore(fasteStore)

      root = ReactDOM.createRoot(document.getElementById(elementID) as HTMLElement)
      await ModuleLoader.fetchThemeCSS(5)
      root.render(
        <Suspense>
          <FasteStoreProvider store={fasteStore}>
            <Router basename={route.path}>{initApp(moduleProps)}</Router>
          </FasteStoreProvider>
        </Suspense>
      )
    },
    unmount: () => {
      if (root) {
        root.unmount()
      }
    }
  }
}
