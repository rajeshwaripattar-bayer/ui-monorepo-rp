import { render } from '@testing-library/react'

import RecommendedRange from './RecommendedRange'

describe('RecommendedRange', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RecommendedRange />)
    expect(baseElement).toBeTruthy()
  })
})
