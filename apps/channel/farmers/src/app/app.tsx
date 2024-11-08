// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'
import type { ReactElement } from 'react'

import { Route, Routes } from 'react-router-dom'
import { MyFarmers, FarmerProfile, useAppDispatch, RootState } from '@gc/features-common-farmers'
import { ReturnDetailsMobile, DeliveryDetailsMobile } from '@gc/components'
import { setNotification } from '@gc/redux-store'
import { useSelector } from 'react-redux'
import { Snackbar } from '@gc/components'
import { useScreenRes } from '@gc/hooks'
import { resolutions } from '@gc/constants'

const App = ({ base }: { base: string }): ReactElement => {
  const res = useScreenRes()
  const dispatch = useAppDispatch()
  const notification = useSelector((state: RootState) => state.app.notification)
  return (
    <>
      <Routes>
        <Route path='/' element={<MyFarmers />} />
        <Route path='/:code' element={<FarmerProfile />} />
        {res <= resolutions.M1023 && (
          <>
            <Route path='/returns/:code' element={<ReturnDetailsMobile />} />
            <Route path='/deliveries/:code' element={<DeliveryDetailsMobile />} />
          </>
        )}
      </Routes>
      <Snackbar
        handleClose={() => dispatch(setNotification({ open: false, message: '' }))}
        notification={notification}
      />
    </>
  )
}

export default App
