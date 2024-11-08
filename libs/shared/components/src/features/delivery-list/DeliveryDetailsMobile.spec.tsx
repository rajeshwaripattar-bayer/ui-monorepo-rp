import { render } from '@testing-library/react'
import { Delivery } from '@gc/types'

import DeliveryDetailsMobile from './DeliveryDetailsMobile'

const delivery: Delivery = {
  agent: {
    name: 'BRIAN HAVLIK',
    uid: '0009146406'
  },
  code: '0801760288',
  createdOnDateTime: '2024-06-24T13:23:14-05:00',
  entries: [
    {
      deliveryItemNumber: '000020',
      product: {
        available: 0.0,
        code: '000000000091057659',
        name: 'PR108-20RIB VT2PRIB 80M BAG ELT500 N-B-E'
      },
      quantity: 1,
      salesOrderEntryNumber: '20',
      salesUnitOfMeasureCode: 'ST'
    },
    {
      batchName: 'L42S7RMKP',
      deliveryItemNumber: '000010',
      product: {
        available: 0.0,
        code: '000000000088333144',
        name: '189-64VT2PRIB 50U BOX BAS500 B'
      },
      quantity: 1,
      salesOrderEntryNumber: '10',
      salesUnitOfMeasureCode: 'SSU',
      seedSize: 'R2'
    }
  ],
  farmer: {
    name: 'CARL GREEN',
    uid: '0009221009'
  },
  salesOrderId: 'BC-0002222577',
  salesYear: '2024',
  status: 'DELIVERED'
}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}))

jest.mock('@gc/hooks', () => ({
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 5
}))

describe('ReturnsDetailsMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeliveryDetailsMobile />)
    expect(baseElement).toBeTruthy()
  })
})
