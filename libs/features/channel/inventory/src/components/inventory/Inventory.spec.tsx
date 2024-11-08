import { render } from '@testing-library/react'

import Inventory from './Inventory'

describe('Orders', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Inventory />)
    expect(baseElement).toBeTruthy()
  })
})
