import { render } from '@testing-library/react'

import CropSummary from './CropSummary'

describe('CropSummary', () => {
  it('should render successfully', () => {
    const mockCropLevelDetails = [
      {
        crop: 'Corn',
        cropDisplayText: 'Corn',
        details: {
          averagePricePerUnit: 3.4,
          currency: 'USD',
          discountPrice: 400,
          grossPrice: 4000,
          netPrice: 3600,
          percentageDiscount: 10,
          productsCount: 3
        }
      },
      {
        crop: 'Soybean',
        cropDisplayText: 'Soybean',
        details: {
          averagePricePerUnit: 4.4,
          currency: 'USD',
          discountPrice: 900,
          grossPrice: 6000,
          netPrice: 5100,
          percentageDiscount: 15,
          productsCount: 3
        }
      }
    ]

    const { queryByTestId, getByText } = render(<CropSummary title='Quote' cropLevelDetails={mockCropLevelDetails} />)
    expect(queryByTestId('summary-title')).toBeTruthy()
    expect(getByText('Quote common.summary.label')).toBeDefined()
  })

  it('should sum up the net price and display the total', () => {
    const mockCropLevelDetails = [
      {
        crop: 'Corn',
        cropDisplayText: 'Corn',
        details: {
          averagePricePerUnit: 3.4,
          currency: 'USD',
          discountPrice: 400,
          grossPrice: 4000,
          netPrice: 3600,
          percentageDiscount: 10,
          productsCount: 3
        }
      },
      {
        crop: 'Soybean',
        cropDisplayText: 'Soybean',
        details: {
          averagePricePerUnit: 4.4,
          currency: 'USD',
          discountPrice: 900,
          grossPrice: 6000,
          netPrice: 5100,
          percentageDiscount: 15,
          productsCount: 3
        }
      }
    ]
    const { queryByTestId, getByText } = render(<CropSummary title='Quote' cropLevelDetails={mockCropLevelDetails} />)
    expect(queryByTestId('summary-title')).toBeTruthy()
    expect(getByText('Quote common.summary.label')).toBeDefined()
    expect(getByText('$8,700.00')).toBeDefined()
  })
})
