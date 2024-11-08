import { render } from '@testing-library/react'

import DiscountDetailsTable from './DiscountDetailsTable'

describe('DiscountDetailsTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DiscountDetailsTable />)
    expect(baseElement).toBeTruthy()
  })
})
