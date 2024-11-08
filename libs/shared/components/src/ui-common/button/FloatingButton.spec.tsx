import { render } from '@testing-library/react'

import FloatingButton from './FloatingButton'

describe('FloatingButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FloatingButton />)
    expect(baseElement).toBeTruthy()
  })
})
