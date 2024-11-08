import { render } from '@testing-library/react'

import ReturnsTableExpandedRowTemplate from './ReturnsTableExpandedRowTemplate'

describe('ReturnsTableExpandedRowTemplate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReturnsTableExpandedRowTemplate />)
    expect(baseElement).toBeTruthy()
  })
})
