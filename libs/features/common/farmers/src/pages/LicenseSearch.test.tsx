import { myCropPortalConfig } from '@gc/shared/env'
import { renderWithTestWrapper, setupFasteStore } from '@gc/shared/test'
import { screen } from '@testing-library/react'
import React from 'react'

import { mockFasteStoreMyCrop } from '../mocks'
import { setupStore } from '../store'
import LicenseSearch from './LicenseSearch'

jest.mock('@gc/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('@gc/hooks'),
  useFarmersModuleConfig: jest.fn(() => ({
    licenseFormConfig: []
  }))
}))

jest.mock('../store', () => ({
  __esModule: true,
  ...jest.requireActual('../store'),
  useLazySearchAccountsQuery: jest.fn(() => [
    () => {
      return new Promise(() => {})
    },
    {
      data: {},
      isLoading: false,
      isError: false,
      refetch: () => {}
    }
  ])
}))

test('renders title', () => {
  renderWithTestWrapper(<LicenseSearch />, {
    fasteStore: setupFasteStore(mockFasteStoreMyCrop, [myCropPortalConfig]),
    providerProps: {
      store: setupStore()
    }
  })

  const title = screen.getByText(/License Agreement/)

  expect(title).toBeInTheDocument()
})
