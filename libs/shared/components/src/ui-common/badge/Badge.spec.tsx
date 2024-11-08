import { render } from '@testing-library/react'

import Badge from './Badge'

const mockPortalConfig = { uiCommon: { badgeThemeColor: {} } }
jest.mock('@gc/hooks', () => ({
  useGcPortalConfig: () => {
    return mockPortalConfig
  }
}))

describe('Badge', () => {
  it('should render successfully', () => {
    mockPortalConfig.uiCommon = {
      badgeThemeColor: [
        {
          color: 'green',
          text: ['Success', 'Confirmed']
        },
        {
          color: 'red',
          text: ['Failure', 'Error']
        }
      ]
    }
    const { container, getByText } = render(<Badge labelText='Confirmed' />)
    expect(getByText('Confirmed')).toBeTruthy()
    expect(container.getElementsByClassName('lmnt-badge').length).toBe(1)
  })

  it('should render text in green', () => {
    mockPortalConfig.uiCommon = {
      badgeThemeColor: [
        {
          color: 'green',
          text: ['Success', 'Confirmed']
        },
        {
          color: 'red',
          text: ['Failure', 'Error']
        }
      ]
    }

    const { container, getByText } = render(<Badge labelText='Confirmed' />)
    expect(getByText('Confirmed')).toBeTruthy()
    expect(container.getElementsByClassName('lmnt-badge').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-badge--label-green').length).toBe(1)
  })

  it('should match color being passed', () => {
    mockPortalConfig.uiCommon = {
      badgeThemeColor: [
        {
          color: 'green',
          text: ['Success', 'Confirmed']
        },
        {
          color: 'red',
          text: ['Failure', 'Error']
        }
      ]
    }

    const { container, getByText } = render(<Badge labelText='Confirmed' themeColor='purple' />)
    expect(getByText('Confirmed')).toBeTruthy()
    expect(container.getElementsByClassName('lmnt-badge').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-badge--label-purple').length).toBe(1)
  })

  it('should render in gray by default', () => {
    mockPortalConfig.uiCommon = {
      badgeThemeColor: [
        {
          color: 'green',
          text: ['Success', 'Confirmed']
        },
        {
          color: 'red',
          text: ['Failure', 'Error']
        }
      ]
    }

    const { container, getByText } = render(<Badge labelText='test' />)
    expect(getByText('test')).toBeTruthy()
    expect(container.getElementsByClassName('lmnt-badge').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-badge--label-gray').length).toBe(1)
  })
})
