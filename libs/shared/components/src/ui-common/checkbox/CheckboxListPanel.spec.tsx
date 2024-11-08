import { render } from '@testing-library/react'
import CheckboxListPanel from './CheckboxListPanel'
import { useTranslation } from 'react-i18next'

const i18nextTranslations: { [key: string]: string } = {
  'common.select_all.label': 'Select All'
}

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}))

describe('CheckboxListPanel', () => {
  beforeAll(() => {
    const useTranslationSpy = useTranslation as jest.Mock
    useTranslationSpy.mockReturnValue({
      t: jest.fn((str) => i18nextTranslations[str] ?? str),
      i18n: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        changeLanguage: () => new Promise(() => {})
      }
    })
  })

  it('should render title, select-all-switch, checkboxes successfully', () => {
    const { getByText, getByTestId } = render(
      <CheckboxListPanel
        title='Years'
        category='year'
        enableSelectAll
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: ['2022']
        }}
      />
    )

    expect(getByTestId('select-all-switch')).toBeDefined()
    expect(getByText('Select All')).toBeTruthy()
    expect(getByTestId('title')).toBeDefined()
    expect(getByText('Years')).toBeTruthy()
    expect(getByTestId('checkbox-2022')).toBeDefined()
    expect(getByTestId('checkbox-2023')).toBeDefined()
    expect(getByTestId('checkbox-2024')).toBeDefined()
  })

  it('should not render title when value is not passed ', () => {
    const { queryByTestId } = render(
      <CheckboxListPanel
        category='year'
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: []
        }}
      />
    )
    expect(queryByTestId('title')).toBeFalsy()
  })
  it('should not render title when value is not passed ', () => {
    const { queryByTestId } = render(
      <CheckboxListPanel
        category='year'
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: []
        }}
      />
    )
    expect(queryByTestId('title')).toBeFalsy()
  })

  it('should render checkboxes in the elements themeColor based on value being passed', () => {
    const { container } = render(
      <CheckboxListPanel
        category='year'
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: [],
          themeColor: 'secondary'
        }}
      />
    )
    expect(container.getElementsByClassName('lmnt-checkbox--secondary').length).toBe(3)
  })

  it('should render switch with specific label as passed in props', () => {
    const { getByTestId, queryByText } = render(
      <CheckboxListPanel
        enableSelectAll
        category='year'
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: []
        }}
        switchProps={{
          label: 'On/Off'
        }}
      />
    )
    expect(getByTestId('select-all-switch')).toBeDefined()
    expect(queryByText('On/Off')).toBeTruthy()
  })

  it('should render switch with elements theme color being passed', () => {
    const { getByTestId, container } = render(
      <CheckboxListPanel
        enableSelectAll
        category='year'
        onChange={jest.fn()}
        checkBoxListProps={{
          itemList: ['2022', '2023', '2024'],
          selectedItems: []
        }}
        switchProps={{
          label: 'On/Off',
          themeColor: 'secondary'
        }}
      />
    )
    expect(getByTestId('select-all-switch')).toBeDefined()
    expect(container.getElementsByClassName('lmnt-switch--secondary').length).toBe(1)
  })
})
