import { Option } from '@gc/components/types'
import { fireEvent, render } from '@gc/utils'
import { RowData } from '../RefWrapper'
import RadioMenuColumn from './RadioMenuColumn'

const translations: { [key: string]: string } = {
  'common.cancel.label': 'Cancel',
  'common.apply.label': 'Apply'
}

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => translations[str]
    }
  }
}))

describe('RadioMenuColumn', () => {
  const options: Option[] = [
    { text: 'Option 1', value: 'option1' },
    { text: 'Option 2', value: 'option2' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render snapshot successfully (no apply all)', () => {
    const defaultValue = { text: 'Option 1', value: 'option1' }
    const row: RowData = { rowIndex: 0 }

    const { getByText, queryByText, getAllByRole, getByLabelText } = render(
      <RadioMenuColumn
        row={row}
        options={options}
        value={defaultValue}
        accessor={'warehouse'}
        handleChange={() => console.log('clicked')}
      />
    )

    // Switch + apply and cancel buttons
    const buttons = getAllByRole('button')
    expect(buttons.length).toBe(3)
    expect(getByText('Apply')).toBeDefined()
    expect(getByText('Cancel')).toBeDefined()

    // Switch is not rendered
    expect(queryByText('Apply All')).toBeNull()

    const option1 = getByLabelText('Option 1') as HTMLInputElement
    const option2 = getByLabelText('Option 2') as HTMLInputElement

    expect(option1.checked).toEqual(true)
    expect(option2.checked).toEqual(false)

    fireEvent.click(option2)

    expect(option1.checked).toEqual(false)
    expect(option2.checked).toEqual(true)
  })

  it('should render snapshot successfully (apply all)', () => {
    const defaultValue = { text: 'Option 2', value: 'option2' }
    const row: RowData = { rowIndex: 0 }

    const { getByText, queryByText, getAllByRole, getByLabelText } = render(
      <RadioMenuColumn
        row={row}
        options={options}
        value={defaultValue}
        accessor={'warehouse'}
        handleChange={() => {}}
        applyToAllProps={{ label: 'Apply All', applied: true }}
      />
    )

    const buttons = getAllByRole('button')
    expect(buttons.length).toBe(3)

    expect(getByText('Apply')).toBeDefined()
    expect(getByText('Cancel')).toBeDefined()

    // Switch is not rendered
    expect(queryByText('Apply All')).toBeDefined()

    const option1 = getByLabelText('Option 1') as HTMLInputElement
    const option2 = getByLabelText('Option 2') as HTMLInputElement

    expect(option1.checked).toEqual(false)
    expect(option2.checked).toEqual(true)

    fireEvent.click(option1)

    expect(option1.checked).toEqual(true)
    expect(option2.checked).toEqual(false)
  })

  it('cancel should reset attributes', () => {
    const defaultValue = { text: 'Option 1', value: 'option1' }
    const row: RowData = { rowIndex: 0 }

    const { getByRole, getByLabelText } = render(
      <RadioMenuColumn
        row={row}
        options={options}
        value={defaultValue}
        accessor={'warehouse'}
        handleChange={() => {}}
        applyToAllProps={{ label: 'Apply All', applied: true }}
      />
    )

    const option1 = getByLabelText('Option 1') as HTMLInputElement
    const option2 = getByLabelText('Option 2') as HTMLInputElement
    const applyAllSwitch = getByRole('switch') as HTMLInputElement

    expect(option1.checked).toEqual(true)
    expect(option2.checked).toEqual(false)
    expect(applyAllSwitch.getAttribute('checked')).toBeNull()

    fireEvent.click(option2)
    fireEvent.click(applyAllSwitch)

    expect(option1.checked).toEqual(false)
    expect(option2.checked).toEqual(true)
    expect(applyAllSwitch.getAttribute('checked')).toBeDefined()

    // click cancel
    const cancelButton = getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    expect(option1.checked).toEqual(true)
    expect(option2.checked).toEqual(false)
    expect(applyAllSwitch.getAttribute('checked')).toBeNull()
  })
})
