import { render } from '@testing-library/react'

import ExpandedRowTemplate from './ExpandedRowTemplate'

describe('ExpandedRowTemplate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExpandedRowTemplate />)
    expect(baseElement).toBeTruthy()
  })
})
