import { render } from '@testing-library/react'

import DeliveryList from './DeliveryList'

describe('DeliveryList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeliveryList />)
    expect(baseElement).toBeTruthy()
  })
})
