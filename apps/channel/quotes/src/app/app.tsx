import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'
import { useEffect, type ReactElement } from 'react'

import { Route, Routes } from 'react-router-dom'
import { Quotes, QuoteDetails, useAppDispatch, type RootState } from '@gc/features-channel-quotes'
import { setNotification, useQuotesQueries } from '@gc/redux-store'
import { Contingency, Snackbar } from '@gc/components'

const App = ({ base: _base }: { base: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const quotesApi = useQuotesQueries()

  useEffect(() => {
    return () => {
      // Before leaving the Quotes module, we are resetting quotes related APIs.
      if (!window.location.pathname.endsWith('quotes')) {
        dispatch(quotesApi.util.resetApiState())
      }
    }
  })

  return (
    <>
      <Routes>
        <Route path='/' element={<Quotes />} />
        <Route path='/:code' element={<QuoteDetails />} />
      </Routes>
      <Snackbar handleClose={() => dispatch(setNotification({ open: false, message: '' }))} />
      <Contingency<RootState> codes={['ALL']} types={['dialog', 'loadingModal']} dispatch={dispatch} />
    </>
  )
}

export default App
