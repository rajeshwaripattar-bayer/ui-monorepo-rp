import { myCropPortalConfig } from '@gc/shared/env'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { mockFarmerDetailsAngell } from '../mocks'
import FarmerDetails from './FarmerDetails'

test('renders fields and data', () => {
  render(<FarmerDetails fields={myCropPortalConfig.farmersModule.farmerDetailFields} data={mockFarmerDetailsAngell} />)

  const licenseStatusHeader = screen.queryAllByText(/farmers.farmerDetails.list.licenseStatus/)
  const licenseStatusData = screen.queryAllByText(/Not Licensed/)

  expect(licenseStatusHeader).toBeTruthy()
  expect(licenseStatusData).toBeTruthy()
})
