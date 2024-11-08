import { render } from '@testing-library/react'

import TopBar from './TopBar'

describe('TopBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TopBar title='Test' />)
    expect(baseElement).toBeTruthy()
  })
})
