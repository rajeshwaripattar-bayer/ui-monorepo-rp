// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'
import type { ReactElement } from 'react'

import { Route, Routes } from 'react-router-dom'
import { Orders, OrderDetails } from '@gc/features-channel-orders'
import { useAppDispatch, RootState } from '@gc/features-channel-orders'
import { setNotification } from '@gc/redux-store'
import { Contingency, Snackbar } from '@gc/components'

const App = ({ base: _base }: { base: string }): ReactElement => {
  const dispatch = useAppDispatch()
  return (
    <>
      <Routes>
        <Route path='/' element={<Orders />} />
        <Route path='/:code' element={<OrderDetails />} />
      </Routes>
      <Snackbar handleClose={() => dispatch(setNotification({ open: false, message: '' }))} />
      <Contingency<RootState> codes={['ALL']} types={['dialog', 'loadingModal']} dispatch={dispatch} />
    </>
  )
}

export default App
