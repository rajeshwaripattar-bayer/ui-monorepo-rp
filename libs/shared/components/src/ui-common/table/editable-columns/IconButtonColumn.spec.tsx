import { render } from '@testing-library/react'

import IconButtonColumn from './IconButtonColumn'

describe('IconButtonColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IconButtonColumn />)
    expect(baseElement).toBeTruthy()
  })
})
