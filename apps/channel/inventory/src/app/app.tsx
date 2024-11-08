// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'
import type { ReactElement } from 'react'

import { Route, Routes } from 'react-router-dom'
import { Inventory, Shipments } from '@gc/features-channel-inventory'
import { useAppDispatch, RootState } from '@gc/features-channel-inventory'
import { setNotification } from '@gc/redux-store'
import { Contingency, Snackbar } from '@gc/components'

const App = ({ base: _base }: { base: string }): ReactElement => {
  const dispatch = useAppDispatch()
  return (
    <>
      <Routes>
        <Route path='/' element={<Inventory />} />
        <Route path='/:tab' element={<Inventory />} />
        <Route path='/shipments' element={<Shipments />} />
      </Routes>
      <Snackbar handleClose={() => dispatch(setNotification({ open: false, message: '' }))} />
      <Contingency<RootState> codes={['ALL']} types={['dialog', 'loadingModal']} dispatch={dispatch} />
    </>
  )
}

export default App
