import { render } from '@testing-library/react'

import FarmerProfile from './FarmerProfile'

describe('FarmerDetails', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = render(<FarmerProfile />)
    expect(baseElement).toBeTruthy()
  })
})
