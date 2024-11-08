import { render } from '@testing-library/react'

import ReturnProductListMobile from './ReturnProductListMobile'

describe('ReturnProductListMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReturnProductListMobile />)
    expect(baseElement).toBeTruthy()
  })
})
