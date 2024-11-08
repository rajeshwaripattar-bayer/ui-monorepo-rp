import { render } from '@testing-library/react'

import SearchBarMobile from './SearchBarMobile'

describe('SearchBarMobile', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SearchBarMobile onChange={() => {}} onClick={() => {}} />)
    expect(baseElement).toBeTruthy()
  })
})
