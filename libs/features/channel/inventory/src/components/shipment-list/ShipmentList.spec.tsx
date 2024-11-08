import { render } from '@testing-library/react'

import ShipmentList from './ShipmentList'

describe('DeliveryList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShipmentList tableTitle={''} fasteStoreKey={''} />)
    expect(baseElement).toBeTruthy()
  })
})
