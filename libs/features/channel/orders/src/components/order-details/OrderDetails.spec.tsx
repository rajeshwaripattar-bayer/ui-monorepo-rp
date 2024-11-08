import { render } from '@testing-library/react'

import OrderDetails from './OrderDetails'

describe('OrderDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrderDetails />)
    expect(baseElement).toBeTruthy()
  })
})
