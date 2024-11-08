import { render, fireEvent } from '@gc/utils'

import DiscountSection from './DiscountSection'
import { Discount } from '@gc/types'

const mockPortalConfig = {
  gcPortalConfig: {
    uiCommon: {
      badgeThemeColor: [
        {
          color: 'green',
          text: ['Success', 'Confirmed', 'Applied']
        },
        {
          color: 'red',
          text: ['Failure', 'Error']
        }
      ]
    }
  }
}

jest.mock('@gc/hooks', () => ({
  usePortalConfig: () => {
    return mockPortalConfig
  },
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 500
}))

describe('DiscountSection', () => {
  it('should render title', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }
    const { getByTestId, getByText } = render(<DiscountSection discountData={discountData} />)
    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Corn Credit')).toBeTruthy()
  })

  it('should render remaining budget information when passed', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      remainingdBudget: 3000,
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }
    const { getByTestId } = render(<DiscountSection discountData={discountData} />)
    expect(getByTestId('remaining_budget')).toBeTruthy()
  })

  it('should not render remaining budget information when not passed', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }
    const { queryByTestId } = render(<DiscountSection discountData={discountData} />)
    expect(queryByTestId('remaining_budget')).toBeFalsy()
  })

  it('should render remaining budget information in warning color when value is negative', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      remainingdBudget: -3000,
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }
    const { getByTestId, container } = render(<DiscountSection discountData={discountData} />)
    expect(getByTestId('remaining_budget')).toBeTruthy()
    expect(container.getElementsByClassName('warning_text').length).toBe(1)
  })

  it('should render all details with no border for card', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      remainingdBudget: 3000,
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }

    const { container } = render(<DiscountSection discountData={discountData} noBorder />, { width: 1320 })

    expect(container.getElementsByClassName('card_no_border').length).toBe(1)
  })

  it('should render all details with no padding for card / card body', () => {
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      remainingdBudget: 3000,
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market',
          discountValue: 200,
          discountPercent: 3
        }
      ]
    }

    const { container } = render(<DiscountSection discountData={discountData} noPadding />, { width: 1320 })

    expect(container.getElementsByClassName('card_title_no_padding').length).toBe(1)
    expect(container.getElementsByClassName('card_body_no_padding').length).toBe(1)
  })

  it('should trigger Remove Discount handler method onClick', () => {
    const mockRemoveDiscountOnClick = jest.fn()
    const discountData: Discount = {
      discountProgram: 'Corn Credit',
      remainingdBudget: -3000,
      discountStrategy: [
        {
          code: 'whole_farm',
          name: 'Whole Farm',
          discountValue: 300,
          discountPercent: 5
        },
        {
          code: 'Loyalty',
          name: 'Loyalty'
        },
        {
          code: 'market',
          name: 'Market'
        }
      ]
    }

    const { getByTestId } = render(
      <DiscountSection
        discountData={discountData}
        discountItemProps={{
          enableHover: true,
          onRemoveDiscount: mockRemoveDiscountOnClick,
          onDiscountItemClick: jest.fn
        }}
      />,
      { width: 1320 }
    )

    expect(getByTestId('remove-discount-icon')).toBeTruthy()
    fireEvent.click(getByTestId('remove-discount-icon'))
    expect(mockRemoveDiscountOnClick).toHaveBeenCalledTimes(1)
  })
})
