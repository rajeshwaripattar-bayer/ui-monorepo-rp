import { render } from '@testing-library/react'

import ShipmentTableExpandedRowTemplate from './ShipmentTableExpandedRowTemplate'

describe('OrdersTableExpandedRowTemplate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShipmentTableExpandedRowTemplate delivery={{}} trackShipment={function (): void {
      throw new Error('Function not implemented.')
    } } />)
    expect(baseElement).toBeTruthy()
  })
})
