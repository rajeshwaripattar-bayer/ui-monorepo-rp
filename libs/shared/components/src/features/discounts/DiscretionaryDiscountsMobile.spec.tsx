import { render } from '@testing-library/react'

import DiscretionaryDiscountsMobile from './DiscretionaryDiscountsMobile'
import { Strategy } from '@gc/types'

describe('DiscretionaryDiscount', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DiscretionaryDiscountsMobile
        discountData={[]}
        onDiscountItemClick={function (programName: string, strategy: Strategy): void {
          throw new Error('Function not implemented.')
        }}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
