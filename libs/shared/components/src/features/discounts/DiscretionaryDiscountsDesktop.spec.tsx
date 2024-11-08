import { render } from '@testing-library/react'

import DiscretionaryDiscountsDesktop from './DiscretionaryDiscountsDesktop'

describe('DiscretionaryDiscountsDesktop', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DiscretionaryDiscountsDesktop />)
    expect(baseElement).toBeTruthy()
  })
})
