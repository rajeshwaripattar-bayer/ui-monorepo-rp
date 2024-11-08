import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table, { HeaderType } from './Table'

describe('Table', () => {
  const headers = [
    { header: 'H1', accessor: 'a1' },
    { header: 'H2', accessor: 'a2' }
  ]
  const headersWithSelect: HeaderType<object>[] = [
    {
      header: 'H1',
      accessor: 'a1',
      widthPercentage: 50,
      editProps: {
        editType: 'select',
        selectProps: {
          onChange: jest.fn(),
          options: [{ text: 'Option 1', value: 'option1' }]
        }
      }
    },
    { header: 'H2', accessor: 'a2', widthPercentage: 50 }
  ]

  const data = [
    { a1: 'V11', a2: 'V12' },
    { a1: 'V21', a2: 'V22' }
  ]
  it('should render successfully', () => {
    const { baseElement } = render(<Table title='Sample' headers={headers} data={data} />)
    expect(baseElement).toBeTruthy()
  })

  it('should not render expanded rows when template is not provided', () => {
    const { queryByRole } = render(<Table title='Sample' headers={headers} data={data} />)
    expect(queryByRole('button', { name: 'keyboard_arrow_right' })).toBeNull()
  })

  it('should render expanded rows when template is provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expandedRowTemplate = ({ row }: any) => <h1>Expanded Content</h1>
    const { getByRole, getAllByRole, getByText } = render(
      <Table title='Sample' headers={headers} data={data} expandedRowTemplate={expandedRowTemplate} />
    )
    expect(getAllByRole('button', { name: 'keyboard_arrow_right' })).toBeTruthy()
    fireEvent.click(getAllByRole('button', { name: 'keyboard_arrow_right' })[0])
    expect(getByRole('button', { name: 'keyboard_arrow_down' })).toBeTruthy()
    expect(getByText('Expanded Content')).toBeTruthy()
  })

  it('should not render title when custom top bar is provided', () => {
    const { queryByText } = render(
      <Table title='PROP_TITLE' headers={headers} data={data} customTopBar={<p>TopBar</p>} />
    )
    expect(queryByText('PROP_TITLE')).toBeNull()
  })

  it('should render default table top bar with search when custom top bar is not provided', () => {
    const { queryByText, queryByRole } = render(<Table title='PROP_TITLE' headers={headers} data={data} />)
    expect(queryByText('PROP_TITLE')).toBeDefined()
    expect(queryByRole('button', { name: 'search' })).toBeDefined()
  })

  it('should render wrap table in div for dynamic width adjustments', () => {
    const headers = [
      { header: 'H1', accessor: 'a1', widthPercentage: 50 },
      { header: 'H2', accessor: 'a2', widthPercentage: 50 }
    ]
    const { getByTestId } = render(<Table title='Sample' headers={headers} data={data} />)
    expect(getByTestId('dynamicWidthTable')).toBeTruthy()
  })

  it('should not wrap table in div for standard layout table', () => {
    const headers = [
      { header: 'H1', accessor: 'a1', widthPercentage: 50 },
      { header: 'H2', accessor: 'a2', widthPercentage: 50 }
    ]
    const { queryByTestId } = render(<Table title='Sample' headers={headers} data={data} layout='standard' />)
    expect(queryByTestId('dynamicWidthTable')).toBeNull()
  })

  it('should not render editable columns when editable is not true', () => {
    const { queryAllByRole } = render(
      <Table title='Sample' headers={headersWithSelect} data={data} layout='standard' />
    )
    expect(queryAllByRole('combobox').length).toBe(0)
  })

  it('should render editable columns from headers with editable true', () => {
    const { queryAllByRole } = render(
      <Table title='Sample' headers={headersWithSelect} data={data} layout='standard' editable />
    )
    expect(queryAllByRole('combobox').length).toBe(2)
  })

  it('should update editable tables columns with displayTemplate', () => {
    const headers: HeaderType<object>[] = [
      {
        header: 'H1',
        accessor: 'a1',
        editProps: {
          editType: 'textfield',
          textfieldProps: {
            onChange: jest.fn(),
            onBlur: jest.fn()
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { header: 'H2', accessor: 'a2', displayTemplate: (val, data: any) => <span>{data.a1 + 1} Items</span> }
    ]
    const data = [
      { a1: 1, a2: 'V12' },
      { a1: 1, a2: 'V22' }
    ]
    const { queryAllByText, getAllByRole } = render(
      <Table title='Sample' headers={headers} data={data} layout='standard' editable />
    )
    expect(queryAllByText(/2 Items/).length).toBe(2)
    fireEvent.change(getAllByRole('textbox')[1], { target: { value: '5' } })
    expect(queryAllByText(/6 Items/).length).toBe(1)
  })

  it('should update all select type values if apply all is selected', async () => {
    const user = userEvent.setup()
    const headersWithSelect: HeaderType<object>[] = [
      {
        header: 'H1',
        accessor: 'a1',
        editProps: {
          editType: 'select',
          selectProps: {
            onChange: jest.fn(),
            options: [
              { text: 'Option 1', value: 'option1' },
              { text: 'Option 2', value: 'option2' }
            ],
            applyToAllRowsLabel: 'Apply to all rows'
          }
        }
      },
      { header: 'H2', accessor: 'a2' }
    ]
    const data = [
      { a1: { text: 'Option 1', value: 'option1' }, a2: 'V12' },
      { a1: { text: 'Option 1', value: 'option1' }, a2: 'V22' }
    ]
    const { queryAllByText, getAllByRole } = render(
      <Table title='Sample' headers={headersWithSelect} data={data} layout='standard' editable />
    )
    expect(queryAllByText('Option 1').length).toBe(2)
    await user.click(getAllByRole('combobox')[0])
    await user.click(getAllByRole('switch')[0])
    await user.click(getAllByRole('option', { name: 'Option 2' })[0])
    expect(queryAllByText('Option 1').length).toBe(0)
    expect(queryAllByText('Option 2').length).toBe(2)
  })
})
