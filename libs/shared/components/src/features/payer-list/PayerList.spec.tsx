import { render, fireEvent } from '@gc/utils'
import { BillToParty } from '@gc/types'
import { TypoSubtitle } from '@element/react-typography'

import PayerList from './PayerList'

describe('PayerList', () => {
  it('should render title', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 100,
        sapAccountId: '23432432'
      }
    ]
    const { getByTestId, getByText } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
      />
    )
    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
  })

  it('should render all the action buttons', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { getByTestId, getByText } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
  })

  it('should render all details with no border for card', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        noBorder
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1320 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
    expect(getByTestId('leading-action-button')).toBeTruthy()
    expect(getByTestId('trailing-action-buttons')).toBeTruthy()
    expect(container.getElementsByClassName('card-no-border').length).toBe(1)
  })

  it('should render all details with no padding for card / card body', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        noPadding
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1320 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
    expect(getByTestId('leading-action-button')).toBeTruthy()
    expect(getByTestId('trailing-action-buttons')).toBeTruthy()
    expect(container.getElementsByClassName('card-title-no-padding').length).toBe(1)
    expect(container.getElementsByClassName('card-body-no-padding').length).toBe(1)
  })

  it('should render all the action buttons in trailing structure for desktop  with card borders', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
    expect(getByTestId('leading-action-button')).toBeTruthy()
    expect(getByTestId('trailing-action-buttons')).toBeTruthy()
    expect(container.getElementsByClassName('card').length).toBe(1)
    expect(container.getElementsByClassName('leading-button').length).toBe(1)
    expect(container.getElementsByClassName('trailing-buttons').length).toBe(1)
  })

  it('should render all the action buttons in trailing structure for ipad with card borders', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 700 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
    expect(getByTestId('leading-action-button')).toBeTruthy()
    expect(getByTestId('trailing-action-buttons')).toBeTruthy()
    expect(container.getElementsByClassName('card').length).toBe(1)
    expect(container.getElementsByClassName('leading-button').length).toBe(1)
    expect(container.getElementsByClassName('trailing-buttons').length).toBe(1)
  })

  it('should render all the action buttons in trailing structure for mobile  with no side borders', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 500 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(getByTestId('adjust-split-button')).toBeTruthy()
    expect(getByTestId('leading-action-button')).toBeTruthy()
    expect(getByTestId('trailing-action-buttons')).toBeTruthy()
    expect(container.getElementsByClassName('card-mobile').length).toBe(1)
    expect(container.getElementsByClassName('leading-button').length).toBe(0)
    expect(container.getElementsByClassName('trailing-buttons').length).toBe(0)
    expect(container.getElementsByClassName('lmnt-button--full-width').length).toBe(2)
  })

  it('should render only Add payer button when the no. of bill to parties passed is one', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      }
    ]

    const { getByTestId, getByText, queryByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(queryByTestId('adjust-split-button')).toBeFalsy()
  })

  it('should render only Add payer button with full-width when the no. of bill to parties passed is one, for mobile ', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      }
    ]

    const { container, getByTestId, getByText, queryByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 500 }
    )

    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(queryByTestId('adjust-split-button')).toBeFalsy()
    expect(container.getElementsByClassName('lmnt-button--full-width').length).toBe(1)
  })

  it('should render links in disabled mode when linkProps are not passed', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId, getByText, queryByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(queryByTestId('adjust-split-button')).toBeTruthy()
    expect(container.getElementsByClassName('mdc-theme--text-icon-on-background').length).toBe(2)
  })

  it('should render links in enabled mode when linkProps are passed', () => {
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { container, getByTestId, getByText, queryByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        payerListItemProps={{
          enableLink: true,
          onPayerItemClick: jest.fn
        }}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('title')).toBeTruthy()
    expect(getByText('Billing')).toBeTruthy()
    expect(getByTestId('add-payer-button')).toBeTruthy()
    expect(queryByTestId('adjust-split-button')).toBeTruthy()
    expect(container.getElementsByClassName('mdc-theme--primary').length).toBe(2)
  })

  it('should trigger Add Payer handler method onClick', () => {
    const mockAddPayerOnClick = jest.fn()
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        payerListItemProps={{
          enableLink: true,
          onPayerItemClick: jest.fn
        }}
        actionButtonProps={{
          onAddPayer: mockAddPayerOnClick,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('add-payer-button')).toBeTruthy()
    fireEvent.click(getByTestId('add-payer-button'))
    expect(mockAddPayerOnClick).toHaveBeenCalledTimes(1)
  })

  it('should trigger Remove Payer handler method onClick', () => {
    const mockRemovePayerOnClick = jest.fn()
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        payerListItemProps={{
          enableLink: true,
          onPayerItemClick: jest.fn,
          onRemovePayer: mockRemovePayerOnClick
        }}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: jest.fn
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('remove-payer-icon')).toBeTruthy()
    fireEvent.click(getByTestId('remove-payer-icon'))
    expect(mockRemovePayerOnClick).toHaveBeenCalledTimes(1)
  })

  it('should trigger Adjust Split handler method onClick', () => {
    const mockAdjustSplitOnClick = jest.fn()
    const billToParties: BillToParty[] = [
      {
        isPrimaryBillTo: true,
        name: 'Test',
        paymentTerm: 'NF01',
        paymentTermDescription: 'Net Immediate',
        percentage: 75,
        sapAccountId: '23432432'
      },
      {
        isPrimaryBillTo: false,
        name: 'Test1',
        paymentTerm: 'NF30',
        paymentTermDescription: 'Net 30',
        percentage: 25,
        sapAccountId: '47338822'
      }
    ]

    const { getByTestId } = render(
      <PayerList
        titleText={
          <TypoSubtitle level={1} bold>
            Billing
          </TypoSubtitle>
        }
        payerListData={billToParties}
        payerListItemProps={{
          enableLink: true,
          onPayerItemClick: jest.fn
        }}
        actionButtonProps={{
          onAddPayer: jest.fn,
          onAdjustSplit: mockAdjustSplitOnClick
        }}
      />,
      { width: 1440 }
    )

    expect(getByTestId('adjust-split-button')).toBeTruthy()
    fireEvent.click(getByTestId('adjust-split-button'))
    expect(mockAdjustSplitOnClick).toHaveBeenCalledTimes(1)
  })
})
