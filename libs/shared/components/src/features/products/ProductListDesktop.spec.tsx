import { act, fireEvent, getByText, render, screen } from '@gc/utils'

import ProductListDesktop from './ProductListDesktop'
import { ProductsByCrop } from '@gc/components/types'

jest.mock('@gc/hooks', () => ({
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 5,
  useUpdateFasteStore: () => [jest.fn()],
  useAppSessionData: () => [jest.fn()],
  useUpsertAppSessionData: () => [jest.fn()],
  useSelectedAccount: () => ({ sapAccountId: '123' })
}))

describe('ProductListDesktop', () => {
  const productsByCrop: ProductsByCrop[] = [
    {
      crop: 'Corn',
      products: [
        {
          cropCode: 'seed_corn',
          cropName: 'Corn',
          name: '217-01VT2PRIB 40U BOX ELT1250 N-B-E',
          code: '000000000089238854',
          quantity: 1,
          netQuantity: 1,
          totalDiscount: 46.09,
          discountedUnitPrice: 372.91,
          discounts: [
            {
              programName: 'Prepay',
              strategy: {
                name: 'Prepay (Channel Brand - 08/31/25 - 7%)',
                displayDiscount: 29.33,
                discountValue: 29.33,
                discountPercentage: 7,
                discountUnit: 'BUY'
              }
            },
            {
              programName: 'MY25 Channel Club I',
              strategy: {
                name: 'MY25 Channel Club I ',
                displayDiscount: 16.76,
                discountValue: 16.76,
                discountPercentage: 4,
                discountUnit: 'BUY'
              }
            }
          ],
          unitPrice: 419,
          subTotal: 372.91,
          warehouse: {
            value: 'WH02',
            text: 'BRIAN HAVLIK - BEAN'
          }
        },
        {
          cropCode: 'seed_corn',
          cropName: 'Corn',
          name: '217-01VT2PRIB 40U BOX BAS500 B',
          code: '000000000088333977',
          quantity: 1,
          netQuantity: 1,
          totalDiscount: 43.339999999999996,
          discountedUnitPrice: 350.66,
          discounts: [
            {
              programName: 'Prepay',
              strategy: {
                name: 'Prepay (Channel Brand - 08/31/25 - 7%)',
                displayDiscount: 27.58,
                discountValue: 27.58,
                discountPercentage: 7,
                discountUnit: 'BUY'
              }
            },
            {
              programName: 'MY25 Channel Club I',
              strategy: {
                name: 'MY25 Channel Club I ',
                displayDiscount: 15.76,
                discountValue: 15.76,
                discountPercentage: 4,
                discountUnit: 'BUY'
              }
            }
          ],
          unitPrice: 394,
          subTotal: 350.66,
          warehouse: {
            value: 'WH02',
            text: 'BRIAN HAVLIK - BEAN'
          }
        }
      ],
      avgPrice: 361.79,
      summary: {
        grossPrice: 813,
        discount: 0,
        discountPercentage: 11,
        discounts: [],
        netPrice: 723.57,
        discretionaryDiscounts: [
          {
            programId: '100006',
            programName: 'Prepay',
            totalDiscount: {
              currencyIso: 'USD',
              currencySymbol: '$',
              formattedValue: '$56.91',
              priceType: 'BUY',
              value: 56.91
            },
            type: 'BRAND_DISCOUNT'
          },
          {
            programId: '7000068279',
            programName: 'MY25 Channel Club I',
            totalDiscount: {
              currencyIso: 'USD',
              currencySymbol: '$',
              formattedValue: '$32.52',
              priceType: 'BUY',
              value: 32.52
            },
            type: 'BRAND_DISCOUNT'
          }
        ],
        totalDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$89.43',
          priceType: 'BUY',
          value: 89.43
        },
        grossPriceDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$813.00',
          priceType: 'BUY',
          value: 813
        },
        netPriceDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$723.57',
          priceType: 'BUY',
          value: 723.57
        }
      }
    },
    {
      crop: 'Soybean',
      products: [
        {
          cropCode: 'seed_soybean',
          cropName: 'Soybean',
          name: '3823RXF 40SCU BOX BASIC-F+ILEVO',
          code: '000000000089235782',
          quantity: 1,
          netQuantity: 1,
          totalDiscount: 10.559999999999999,
          discountedUnitPrice: 85.44,
          discounts: [
            {
              programName: 'Prepay',
              strategy: {
                name: 'Prepay (Channel Brand - 08/31/25 - 7%)',
                displayDiscount: 6.72,
                discountValue: 6.72,
                discountPercentage: 7,
                discountUnit: 'BUY'
              }
            },
            {
              programName: 'MY25 Channel Club I',
              strategy: {
                name: 'MY25 Channel Club I ',
                displayDiscount: 3.84,
                discountValue: 3.84,
                discountPercentage: 4,
                discountUnit: 'BUY'
              }
            }
          ],
          unitPrice: 96,
          subTotal: 85.44,
          warehouse: {
            value: 'WH02',
            text: 'BRIAN HAVLIK - BEAN'
          }
        }
      ],
      avgPrice: 85.44,
      summary: {
        grossPrice: 96,
        discount: 0,
        discountPercentage: 11,
        discounts: [],
        netPrice: 85.44,
        discretionaryDiscounts: [
          {
            programId: '100006',
            programName: 'Prepay',
            totalDiscount: {
              currencyIso: 'USD',
              currencySymbol: '$',
              formattedValue: '$6.72',
              priceType: 'BUY',
              value: 6.72
            },
            type: 'BRAND_DISCOUNT'
          },
          {
            programId: '7000068279',
            programName: 'MY25 Channel Club I',
            totalDiscount: {
              currencyIso: 'USD',
              currencySymbol: '$',
              formattedValue: '$3.84',
              priceType: 'BUY',
              value: 3.84
            },
            type: 'BRAND_DISCOUNT'
          }
        ],
        totalDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$10.56',
          priceType: 'BUY',
          value: 10.559999999999999
        },
        grossPriceDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$96.00',
          priceType: 'BUY',
          value: 96
        },
        netPriceDiscretionaryDiscount: {
          currencyIso: 'USD',
          currencySymbol: '$',
          formattedValue: '$85.44',
          priceType: 'BUY',
          value: 85.44
        }
      }
    }
  ]

  it('should render 2 table(1 for each crop) successfully', () => {
    const { container } = render(
      <ProductListDesktop title='Products' productsByCrop={productsByCrop} currencyIso='USD' />,
      { width: 1024 }
    )
    expect(container.getElementsByTagName('table').length).toBe(2)
    // 2 for table element and 2 for element container around that table
    expect(screen.getAllByText(/2 Corn common.product.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/1 Soybean common.product.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/common.average_desktop.label/i)).toHaveLength(2)
    expect(screen.getAllByText(/Corn common.summary.label/i)).toHaveLength(1)
    expect(screen.getAllByText(/Soybean common.summary.label/i)).toHaveLength(1)
    // There should be 3 strike elements in the document based on discounts
    expect(container.getElementsByTagName('s').length).toBe(3)
    // 2 svg icons for corn and Soybean
    expect(container.querySelector('img[src="icon-corn.svg"]')).toBeTruthy()
    expect(container.querySelector('img[src="icon-soybeans.svg"]')).toBeTruthy()
  })

  it('should make quantity and warehouse fields editable when editProps are provided', () => {
    const editModeProps = {
      storageLocations: [
        { locationCode: '00001', locationName: 'Warehouse 1', plant: 'Warehouse East' },
        { locationCode: '00002', locationName: 'Warehouse 2', plant: 'Warehouse West' }
      ],
      handleQuantityUpdate: jest.fn(),
      handleWarehouseUpdate: jest.fn(),
      handleDiscountsClick: jest.fn(),
      handleProductDelete: jest.fn()
    }
    const { getAllByRole } = render(
      <ProductListDesktop
        title='Products'
        productsByCrop={productsByCrop}
        currencyIso='USD'
        editModeProps={editModeProps}
      />,
      { width: 1024 }
    )
    expect(getAllByRole('combobox').length).toBe(3)
    expect(getAllByRole('spinbutton').length).toBe(3) // spinbutton is a textfield with type number!
  })

  it('should show any edit actions when related props are provided', () => {
    const editModeProps = {
      storageLocations: [
        { locationCode: '00001', locationName: 'Warehouse 1', plant: 'Warehouse East' },
        { locationCode: '00002', locationName: 'Warehouse 2', plant: 'Warehouse West' }
      ],
      handleQuantityUpdate: jest.fn(),
      handleWarehouseUpdate: jest.fn(),
      handleDiscountsClick: jest.fn(),
      handleProductDelete: jest.fn(),
      editActions: <div>Edit Actions</div>
    }
    const { getByText } = render(
      <ProductListDesktop
        title='Products'
        productsByCrop={productsByCrop}
        currencyIso='USD'
        editModeProps={editModeProps}
      />,
      { width: 1024 }
    )
    expect(getByText('Edit Actions')).toBeTruthy()
  })

  it('should show delete action column when enableDeleteProduct is true and appropriately handle its click', async () => {
    const mockDelete = jest.fn()
    const editModeProps = {
      storageLocations: [
        { locationCode: '00001', locationName: 'Warehouse 1', plant: 'Warehouse East' },
        { locationCode: '00002', locationName: 'Warehouse 2', plant: 'Warehouse West' }
      ],
      handleQuantityUpdate: jest.fn(),
      handleWarehouseUpdate: jest.fn(),
      handleDiscountsClick: jest.fn(),
      handleProductDelete: mockDelete,
      enableDeleteProduct: true
    }
    const { getAllByRole, getAllByTestId } = render(
      <ProductListDesktop
        title='Products'
        productsByCrop={productsByCrop}
        currencyIso='USD'
        editModeProps={editModeProps}
      />,
      { width: 1024 }
    )
    expect(getAllByRole('cell', { name: 'close' }).length).toBe(3)
    await act(async () => fireEvent.click(getAllByTestId('delete-product')[0]))
    expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining(productsByCrop[0].products[0]))
  })

  it('should render quantity column with header name from quantityAccessor prop', () => {
    const { getAllByText } = render(
      <ProductListDesktop
        title='Products'
        productsByCrop={productsByCrop}
        currencyIso='USD'
        quantityAccessor='netQty'
      />,
      { width: 1024 }
    )
    expect(getAllByText('common.net_qty.label (common.ssu.label)')).toHaveLength(2)
  })
})
