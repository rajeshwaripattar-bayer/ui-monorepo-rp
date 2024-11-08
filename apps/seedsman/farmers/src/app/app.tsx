import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'

import { FarmerInfo, MyFarmers } from '@gc/features-common-farmers'
import { Dashboard, Program } from '@gc/features-common-farmers/federated'
import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'

const App = (): ReactElement => {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/my-farmers' element={<MyFarmers />} />
      <Route path='/farmer-info' element={<FarmerInfo />} />
      <Route path='/programs/:programname' element={<Program />} />
    </Routes>
  )
}

export default App
