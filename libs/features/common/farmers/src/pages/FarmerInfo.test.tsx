import { myCropPortalConfig as mockMyCropPortalConfig } from '@gc/shared/env'
import { renderWithTestWrapper, setupFasteStore } from '@gc/shared/test'
import { screen } from '@testing-library/react'
import React from 'react'

import { mockFarmerDetailsAngell, mockFasteStoreMyCrop } from '../mocks'
import { setupStore } from '../store'
import FarmerInfo from './FarmerInfo'

jest.mock('@gc/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('@gc/hooks'),
  useFarmersModuleConfig: jest.fn(() => mockMyCropPortalConfig.farmersModule)
}))

jest.mock('../hooks/useColumns', () => ({
  __esModule: true,
  useColumns: jest.fn(() => ({
    farmerCropTotalsColumns: [],
    farmerProductsOrderedColumns: [],
    zoneDetailsColumns: []
  }))
}))

jest.mock('../hooks/useFarmerOrderDetails', () => ({
  __esModule: true,
  useFarmerOrderDetails: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false
  }))
}))

jest.mock('../hooks/useFarmerOffers', () => ({
  __esModule: true,
  useFarmerOffers: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false
  }))
}))

jest.mock('../store', () => ({
  __esModule: true,
  ...jest.requireActual('../store'),
  useGetSingleFarmerDetailsQuery: jest.fn(() => [jest.fn(), { data: {} }]),
  useLazyGetSingleFarmerDetailsQuery: jest.fn(() => [jest.fn(), { data: {} }])
}))

test('renders title', () => {
  renderWithTestWrapper(<FarmerInfo />, {
    fasteStore: setupFasteStore(mockFasteStoreMyCrop, [mockMyCropPortalConfig]),
    providerProps: {
      store: setupStore()
    },
    memoryRouterProps: {
      initialEntries: [
        { pathname: '/my-farmers' },
        { pathname: '/farmer-info', state: { farmer: mockFarmerDetailsAngell } }
      ]
    }
  })

  const farmName = screen.queryAllByAltText(/TestF TestL/)
  const licenseStatusHeader = screen.queryAllByAltText(/licenseStatus/i)
  const licenseStatusData = screen.queryAllByAltText(/Not Licensed/)

  expect(farmName).toBeTruthy()
  expect(licenseStatusHeader).toBeTruthy()
  expect(licenseStatusData).toBeTruthy()
})
