import { render } from '@testing-library/react'

import ActionMenuButton from './ActionMenuButton'

describe('ActionMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionMenuButton actionItems={[]} />)
    expect(baseElement).toBeTruthy()
  })
})
