import { render } from '@testing-library/react'

import NestedTable from './NestedTable'

describe('NestedTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NestedTable />)
    expect(baseElement).toBeTruthy()
  })
})
