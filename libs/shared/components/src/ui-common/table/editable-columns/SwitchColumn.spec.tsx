import { render } from '@testing-library/react'

import SwitchColumn from './SwitchColumn'

describe('SwitchColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SwitchColumn />)
    expect(baseElement).toBeTruthy()
  })
})
