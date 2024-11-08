import { myCropPortalConfig } from '@gc/shared/env'
import { renderWithTestWrapper, setupFasteStore } from '@gc/shared/test'
import { screen } from '@testing-library/react'
import React from 'react'

import { mockFarmerDetailsAngell, mockFasteStoreMyCrop } from '../mocks'
import { setupStore } from '../store'
import MyFarmers from './MyFarmers'

jest.mock('../hooks/useColumns', () => ({
  __esModule: true,
  useColumns: jest.fn(() => ({
    farmerListColumns: [],
    farmerDownloadReportColumns: []
  }))
}))

jest.mock('../hooks/useFarmerDetails', () => ({
  __esModule: true,
  useFarmerDetails: jest.fn(() => ({
    data: { farmerDetails: [mockFarmerDetailsAngell] },
    isLoading: false,
    isError: false
  }))
}))

test('renders title', () => {
  renderWithTestWrapper(<MyFarmers />, {
    fasteStore: setupFasteStore(mockFasteStoreMyCrop, [myCropPortalConfig]),
    providerProps: {
      store: setupStore()
    }
  })

  const title = screen.getByText(/common.farmerPage.headerLabel/)

  expect(title).toBeInTheDocument()
})
