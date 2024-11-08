import { render } from '@testing-library/react'

import Shipments from './Shipments'

describe('Orders', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Shipments />)
    expect(baseElement).toBeTruthy()
  })
})
