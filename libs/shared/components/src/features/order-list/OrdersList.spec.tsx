import { render } from '@testing-library/react'

import OrdersList from './OrdersList'

describe('OrdersList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrdersList />)
    expect(baseElement).toBeTruthy()
  })
})
