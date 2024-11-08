import { render } from '@testing-library/react'
import { Delivery } from '@gc/types'

import DeliveryProductListMobile from './DeliveryProductListMobile'

describe('DeliveryProductListMobile', () => {
  it('should render (snapshot test) successfully', () => {
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
    const { baseElement } = render(<DeliveryProductListMobile delivery={delivery} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render title successfully', () => {
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
    const { getByTestId, getByText } = render(<DeliveryProductListMobile delivery={delivery} />)
    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('deliveries.products_in_delivery.label')).toBeTruthy()
  })

  it('should render sub title (order Id) successfully', () => {
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
    const { getByTestId, getByText } = render(<DeliveryProductListMobile delivery={delivery} />)
    expect(getByTestId('orderId')).toBeTruthy()
    expect(getByText('orders.order.label 0002222577')).toBeTruthy()
  })

  it('should render product list successfully', () => {
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
    const { getByText } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(getByText('PR108-20RIB VT2PRIB 80M BAG ELT500 N-B-E')).toBeTruthy()
    expect(getByText('189-64VT2PRIB 50U BOX BAS500 B')).toBeTruthy()
  })

  it('should render product batch name  successfully', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { getByText, getByTestId } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(getByTestId('batchName')).toBeTruthy()
    expect(getByText('L42S7RMKP')).toBeTruthy()
  })

  it('should not render product batch name, if not available', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { queryByTestId } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(queryByTestId('batchName')).toBeNull()
  })

  it('should render product seedsize  successfully', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { getByTestId } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(getByTestId('seedSize')).toBeTruthy()
  })

  it('should not render product seedsize, if not available', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
          salesOrderEntryNumber: '10',
          salesUnitOfMeasureCode: 'SSU'
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
    const { queryByTestId } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(queryByTestId('seedSize')).toBeNull
  })

  it('should render interpunct if both batchname & seedsize are available', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { getByText } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(getByText('•')).toBeTruthy()
  })

  it('should not render interpunct if seedsize is not  available', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
          salesOrderEntryNumber: '10',
          salesUnitOfMeasureCode: 'SSU'
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
    const { queryByText } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(queryByText('•')).toBeNull()
  })

  it('should not render interpunct if batchName is not  available', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { queryByText } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(queryByText('•')).toBeNull()
  })

  it('should render product quantity with units successfully', () => {
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
          salesUnitOfMeasureCode: 'SSU'
        },
        {
          batchName: 'L42S7RMKP',
          deliveryItemNumber: '000010',
          product: {
            available: 0.0,
            code: '000000000088333144',
            name: '189-64VT2PRIB 50U BOX BAS500 B'
          },
          quantity: 10,
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
    const { getByText } = render(<DeliveryProductListMobile delivery={delivery} />)

    expect(getByText('1 SSU')).toBeTruthy()
    expect(getByText('10 SSU')).toBeTruthy()
  })
})
