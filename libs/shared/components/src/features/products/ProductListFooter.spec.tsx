import { render, screen } from '@gc/utils'
import ProductListFooter from './ProductListFooter'
jest.mock('../../../../../hooks/src/useFasteStore.ts', () => ({
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' })
}))

describe('ProductListFooter', () => {
  const productsByCrop = [
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
          discounts: []
        },
        {
          name: 'Product 2',
          quantity: 5,
          totalDiscount: 2,
          discountedUnitPrice: 15,
          unitPrice: 20,
          subTotal: 75,
          discounts: []
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
        netPrice: 148
      }
    }
  ]

  it('should render component successfully', () => {
    const { container } = render(
      <ProductListFooter
        crop={productsByCrop[0].crop}
        currencyIso='USD'
        discount={productsByCrop[0].summary.discount}
        discounts={productsByCrop[0].summary.discounts}
        grossPrice={productsByCrop[0].summary.grossPrice}
        discretionaryDiscounts={[]}
        totalDiscretionaryDiscount={{
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        }}
        grossPriceDiscretionaryDiscount={{
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        }}
        netPriceDiscretionaryDiscount={{
          currencyIso: '',
          currencySymbol: '',
          formattedValue: '',
          priceType: '',
          value: 0
        }}
      />,
      {
        width: 1024
      }
    )
    expect(container.getElementsByTagName('ul').length).toBe(1)
    expect(screen.getAllByText(/common.discounts.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/common.price_before_discounts.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/common.discounts.label/i)).toHaveLength(1)
    expect(container.getElementsByClassName('product-footer-list-item').length).toBeTruthy()
  })
})
