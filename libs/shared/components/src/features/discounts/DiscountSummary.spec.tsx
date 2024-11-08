import { render } from '@testing-library/react'

import DiscountSummary from './DiscountSummary'
import { Strategy } from '@gc/components/types'

describe('DiscountSummary', () => {
  it('should render successfully', () => {
    const mockBrandDiscount: Strategy[] = [
      {
        name: 'Channel Club Discount',
        discountValue: 455,
        discountPercentage: 1,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '4% off retail price'
      },
      {
        name: 'First Down Qualification',
        discountValue: 600,
        discountPercentage: 1.5,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '1% off retail price'
      },
      {
        name: 'Prepay (Cash - 11/15/24)',
        discountValue: 1000,
        discountPercentage: 14,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '14% off retail price',
        isPrepayDiscount: true
      }
    ]

    const { queryByTestId, getByText } = render(
      <DiscountSummary title='Brand Discount' strategies={mockBrandDiscount} />
    )
    expect(queryByTestId('discount-summary-title')).toBeTruthy()
    expect(getByText('Brand Discount common.summary.label')).toBeDefined()
  })

  it('should sum up the net price and display the total', () => {
    const mockBrandDiscount: Strategy[] = [
      {
        name: 'Channel Club Discount',
        discountValue: 400,
        discountPercentage: 1,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '4% off retail price'
      },
      {
        name: 'First Down Qualification',
        discountValue: 600,
        discountPercentage: 1.5,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '1% off retail price'
      },
      {
        name: 'Prepay (Cash - 11/15/24)',
        discountValue: 1000,
        discountPercentage: 14,
        discountUnit: '%',
        displayDiscount: 1,
        discountDescription: '14% off retail price',
        isPrepayDiscount: true
      }
    ]
    const { queryByTestId, getByText } = render(
      <DiscountSummary title='Brand Discount' strategies={mockBrandDiscount} />
    )
    expect(queryByTestId('discount-summary-title')).toBeTruthy()
    expect(getByText('Brand Discount common.summary.label')).toBeDefined()
    expect(getByText('$2,000.00')).toBeDefined()
  })
})
