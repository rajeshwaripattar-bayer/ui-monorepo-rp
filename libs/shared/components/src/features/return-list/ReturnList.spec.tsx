import { render } from '@testing-library/react'

import ReturnList from './ReturnList'

describe('ReturnList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReturnList />)
    expect(baseElement).toBeTruthy()
  })
})
