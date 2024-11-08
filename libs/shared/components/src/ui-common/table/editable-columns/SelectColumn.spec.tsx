import { render } from '@testing-library/react'

import SelectColumn from './SelectColumn'

describe('SelectColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SelectColumn />)
    expect(baseElement).toBeTruthy()
  })
})
