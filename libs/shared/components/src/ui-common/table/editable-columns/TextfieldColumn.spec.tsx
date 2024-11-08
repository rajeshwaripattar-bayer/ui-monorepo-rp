import { render } from '@testing-library/react'

import TextfieldColumn from './TextfieldColumn'

describe('TextfieldColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TextfieldColumn />)
    expect(baseElement).toBeTruthy()
  })
})
