import { render, screen } from '@gc/utils'
import ProductListMobile from './ProductListMobile'
import { renderWithTestWrapper } from '@gc/shared/test'
import { ProductsByCrop } from '@gc/components/types'

jest.mock('@gc/hooks', () => ({
  ...jest.requireActual('@gc/hooks'),
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useAppSessionData: () => [jest.fn()],
  useUpdateFasteStore: () => [jest.fn()]
}))

describe('ProductListMobile', () => {
  const productsByCrop: ProductsByCrop[] = [
    {
      crop: 'Corn',
      products: [
        {
          name: 'Product 1',
          quantity: 10,
          totalDiscount: 5,
          discountedUnitPrice: 8,
          unitPrice: 10,
          subTotal: 80,
          discounts: [],
          cropCode: '',
          cropName: '',
          code: '',
          netQuantity: 0,
          warehouse: {
            value: '',
            text: ''
          }
        },
        {
          name: 'Product 2',
          quantity: 5,
          totalDiscount: 2,
          discountedUnitPrice: 15,
          unitPrice: 20,
          subTotal: 75,
          discounts: [],
          cropCode: '',
          cropName: '',
          code: '',
          netQuantity: 0,
          warehouse: {
            value: '',
            text: ''
          }
        }
      ],
      avgPrice: 15,
      summary: {
        grossPrice: 155,
        discount: 7,
        discountPercentage: 5,
        discounts: [
          {
            name: 'Discount 1',
            value: 3
          },
          {
            name: 'Discount 2',
            value: 4
          }
        ],
        netPrice: 148,
        discretionaryDiscounts: [],
        totalDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        },
        grossPriceDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        },
        netPriceDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        }
      }
    },
    {
      crop: 'Soybean',
      products: [
        {
          name: 'Product 3',
          quantity: 8,
          totalDiscount: 0,
          discountedUnitPrice: 0,
          unitPrice: 15,
          subTotal: 96,
          discounts: [],
          cropCode: '',
          cropName: '',
          code: '',
          netQuantity: 0,
          warehouse: {
            value: '',
            text: ''
          }
        },
        {
          name: 'Product 4',
          quantity: 3,
          totalDiscount: 1,
          discountedUnitPrice: 18,
          unitPrice: 20,
          subTotal: 54,
          discounts: [],
          cropCode: '',
          cropName: '',
          code: '',
          netQuantity: 0,
          warehouse: {
            value: '',
            text: ''
          }
        }
      ],
      avgPrice: 16.5,
      summary: {
        grossPrice: 150,
        discount: 4,
        discountPercentage: 2.5,
        discounts: [
          {
            name: 'Discount 3',
            value: 2
          },
          {
            name: 'Discount 4',
            value: 2
          }
        ],
        netPrice: 146,
        discretionaryDiscounts: [],
        totalDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        },
        grossPriceDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        },
        netPriceDiscretionaryDiscount: {
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        }
      }
    }
  ]

  it('should render component with list successfully', () => {
    const { container } = renderWithTestWrapper(
      <ProductListMobile productsByCrop={productsByCrop} currencyIso='USD' titleText='Products' />,
      {
        width: 1024
      }
    )

    expect(container.getElementsByTagName('ul').length).toBe(4)
    expect(screen.getAllByText(/2 Corn common.product.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/2 Soybean common.product.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/common.average_desktop.label/i)).toHaveLength(2)
    expect(screen.getAllByText(/Corn common.summary.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/Soybean common.summary.label/i)).toHaveLength(1)
    expect(container.querySelector('img[src="icon-corn.svg"]')).toBeTruthy()
    expect(container.querySelector('img[src="icon-soybeans.svg"]')).toBeTruthy()
  })
})
