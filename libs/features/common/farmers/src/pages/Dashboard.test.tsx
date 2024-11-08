import '@testing-library/jest-dom'

import { PortalKey as mockPortalKey } from '@gc/types'
import { render, screen } from '@testing-library/react'
import React from 'react'

import Dashboard from './Dashboard'

jest.mock('@gc/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('@gc/hooks'),
  useSelectedAccount: jest.fn(() => ({
    lob: {}
  })),
  usePortalConfig: jest.fn(() => ({
    portalKey: mockPortalKey.MyCrop,
    nbmWidgetsConfig: { programTracking: {} }
  })),
  useFarmersModuleConfig: jest.fn(() => ({
    farmerDashboardConfig: {}
  }))
}))

jest.mock('../hooks/useFarmerDetails', () => ({
  __esModule: true,
  useFarmerDetails: jest.fn(() => ({
    data: { licensedGrowerTotals: undefined },
    isLoading: false,
    isError: false
  }))
}))

jest.mock('../store', () => ({
  __esModule: true,
  ...jest.requireActual('../store'),
  useGetUnitsDetailsQuery: jest.fn(() => ({
    data: {},
    isLoading: false,
    isError: false
  }))
}))

test('renders title', () => {
  render(<Dashboard />)
  const element = screen.getByText('FARMERS', { selector: 'span.mdc-typography--headline3' })
  expect(element).toBeInTheDocument()
})
