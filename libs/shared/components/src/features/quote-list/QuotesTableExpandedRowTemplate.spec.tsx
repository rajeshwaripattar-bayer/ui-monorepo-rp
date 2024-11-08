import { render } from '@testing-library/react'

import QuotesTableExpandedRowTemplate from './QuotesTableExpandedRowTemplate'

describe('QuotesTableExpandedRowTemplate', () => {
  const quote = {
    code: 'SQ-20240126-094739',
    creationTime: '01/18/2024',
    entries: [
      {
        entryNumber: 100,
        product: {
          code: '000000000012279702',
          name: '192-08VT2PRIB 80M BAG BAS250'
        },
        quantity: 100
      }
    ],
    expirationTime: '02/18/2024',
    farmer: {
      name: 'CARL GREEN',
      sapAccountId: '0009221009'
    },
    name: 'Test Quote',
    orderDiscounts: {
      currencyIso: 'USD',
      currencySymbol: '$',
      value: 0
    },
    totalDiscountsPrice: {
      currencyIso: 'USD',
      currencySymbol: '$',
      value: 0
    },
    salesYear: '2025',
    status: 'BUYER_OFFER',
    totalPrice: {
      currencyIso: 'USD',
      currencySymbol: '$',
      value: 3210
    },
    netPrice: {
      currencyIso: 'USD',
      currencySymbol: '$',
      value: 3210
    },
    updatedTime: '02/09/2024',
    user: {
      name: 'CB US Test User',
      uid: '9126896.cbus@bayer.test'
    },
    totalItems: 5
  }

  it('should render successfully', () => {
    const wrapper = render(<QuotesTableExpandedRowTemplate quote={quote} handleViewQuoteDetails={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should render view quote details button ', () => {
    const { getByRole } = render(<QuotesTableExpandedRowTemplate quote={quote} handleViewQuoteDetails={() => {}} />)
    expect(getByRole('button', { name: 'quotes.view_quote_details.label' })).toBeTruthy()
  })
})
