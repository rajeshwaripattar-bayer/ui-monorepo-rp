import { render } from '@testing-library/react'

import Contingency from './Contingency'

describe('Contingency', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Contingency codes={['DEFAULT']} types={['dialog']} />)
    expect(baseElement).toBeTruthy()
  })
})
