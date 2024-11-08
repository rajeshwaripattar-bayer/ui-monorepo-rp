import { render } from '@testing-library/react'

import BillingSection from './BillingSection'
import { BillToParty } from '@gc/types'

describe('BillingSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BillingSection
        inEditMode={false}
        isLoading={false}
        editQuoteLoading={false}
        actions={{
          dispatch: () => {},
          openEditQuoteModal: function (
            modalName: string,
            opts?: { selectedPayer?: BillToParty | undefined } | undefined
          ): void {
            console.log('modal opened', { modalName, opts })
          }
        }}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
