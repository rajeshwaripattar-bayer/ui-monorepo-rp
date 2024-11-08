import { render } from '@testing-library/react'

import Orders from './Orders'

describe('Orders', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Orders />)
    expect(baseElement).toBeTruthy()
  })
})
