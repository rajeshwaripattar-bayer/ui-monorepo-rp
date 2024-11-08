import './app.module.scss'
import '@gc/shared/assets/dad-theme-overrides.scss'

import { FarmerInfo, LicenseSearch, MyFarmers, MyView } from '@gc/features-common-farmers'
import { Dashboard, Program } from '@gc/features-common-farmers/federated'
import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'

const App = (): ReactElement => {
  return (
    <>
      <MyView />
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/my-farmers' element={<MyFarmers />} />
        <Route path='/farmer-info' element={<FarmerInfo />} />
        <Route path='/license-search' element={<LicenseSearch />} />
        <Route path='/programs/:programname' element={<Program />} />
      </Routes>
    </>
  )
}

export default App
