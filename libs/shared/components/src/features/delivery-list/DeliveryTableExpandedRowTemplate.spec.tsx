import { render } from '@testing-library/react'

import DeliveryTableExpandedRowTemplate from './DeliveryTableExpandedRowTemplate'

describe('OrdersTableExpandedRowTemplate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeliveryTableExpandedRowTemplate />)
    expect(baseElement).toBeTruthy()
  })
})
