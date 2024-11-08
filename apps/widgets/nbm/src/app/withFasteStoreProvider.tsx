import { getFasteStore } from '@gc/utils'
import { FasteStoreProvider } from '@monsantoit/faste-lite-react'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

const withFasteStoreProvider = <P extends JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<P>) => {
  return (props: P) => {
    const fasteStore = getFasteStore()
    const path = fasteStore.fetch('fasteRoute')?.value?.path
    return (
      <FasteStoreProvider store={fasteStore}>
        <Router basename={path}>
          <WrappedComponent {...props} />
        </Router>
      </FasteStoreProvider>
    )
  }
}

export default withFasteStoreProvider
