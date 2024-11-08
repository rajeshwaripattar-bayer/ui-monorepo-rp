import { render } from '@testing-library/react'

import ReturnDetailsMobile from './ReturnDetailsMobile'

describe('ReturnsDetailsMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReturnDetailsMobile />)
    expect(baseElement).toBeTruthy()
  })
})
