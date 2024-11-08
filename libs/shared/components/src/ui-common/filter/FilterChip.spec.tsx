import { act, actAwait, fireEvent, render, screen } from '@gc/utils'
import { Filter } from '@gc/types'
import { noop } from 'lodash'
import FilterChip from './FilterChip'

describe('FilterChip', () => {
  const mockApplyFilters = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const filterList: Filter[] = [
    { category: 'f1', title: 'Filter1', selectedOptions: [], options: ['F1O1', 'F1O2'] },
    { category: 'f2', title: 'Filter2', selectedOptions: [], options: ['F2O1', 'F2O2'] }
  ]
  it('should render successfully for mobile with Bottom Sheet', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1023 }
    )
    expect(screen.getByTestId('filter-bottom-sheet')).toBeDefined()
  })

  it('should render successfully for desktop with Menu', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1440 }
    )
    fireEvent.click(screen.getByTestId('Filters'))

    expect(screen.getByTestId('filter-menu')).toBeDefined()
  })

  it('should have apply and clear button disabled', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1440 }
    )
    fireEvent.click(screen.getByTestId('Filters'))
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeDefined()
  })

  it('should enable apply and clear button once a selection happens', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1440 }
    )
    fireEvent.click(screen.getByTestId('Filters'))
    fireEvent.click(screen.getByTestId('checkbox-F1O1'))

    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeNull()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeNull()
  })

  it('should change Chip label when filters are applied - All Filters', async () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={mockApplyFilters}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1440 }
    )

    fireEvent.click(screen.getByTestId('Filters'))
    fireEvent.click(screen.getByTestId('checkbox-F1O1'))

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'common.apply.label' })))
    const chipStyles = window.getComputedStyle(screen.getByRole('checkbox', { name: 'Filters (1)' }))
    expect(chipStyles.backgroundColor).toBe('')

    expect(screen.getByRole('checkbox', { name: 'Filters (1)' })).toBeTruthy()
    expect(screen.queryByText(/close/)).toBeNull()
    expect(mockApplyFilters).toHaveBeenCalledWith({ f1: ['F1O1'], f2: [] })
  })

  it('should clear all filters and revert label when CLEAR button was clicked - All Filters', () => {
    render(
      <FilterChip
        filterList={[{ ...filterList[0], selectedOptions: ['F1O1'] }, filterList[1]]}
        chipLabel='Filters'
        applyFilters={mockApplyFilters}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1440 }
    )

    expect(screen.getByRole('checkbox', { name: 'Filters (1)' })).toBeTruthy()
    fireEvent.click(screen.getByTestId('Filters'))

    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'common.clear.label' }))
    fireEvent.click(screen.getByRole('button', { name: 'common.apply.label' }))

    expect(screen.queryByRole('checkbox', { name: 'Filters (1)' })).toBeNull()
    expect(mockApplyFilters).toHaveBeenCalledWith({ f1: [], f2: [] })
  })

  it('should change Chip label when filters are applied - Single Filter', () => {
    render(
      <FilterChip
        filterList={[filterList[0]]}
        chipLabel='Filter1'
        applyFilters={mockApplyFilters}
        isAllFilters={false}
        key='filter1'
      />,
      { width: 1440 }
    )

    fireEvent.click(screen.getByTestId('Filter1'))
    fireEvent.click(screen.getByTestId('checkbox-F1O1'))

    fireEvent.click(screen.getByRole('button', { name: 'common.apply.label' }))
    expect(screen.getByRole('checkbox', { name: 'F1O1' })).toBeTruthy()

    const chipStyles = window.getComputedStyle(screen.getByTestId('Filter1'))
    expect(chipStyles.backgroundColor).toBe('rgba(0, 108, 103, 0.3)')

    expect(screen.getByText(/close/)).toBeTruthy()
    expect(mockApplyFilters).toHaveBeenCalledWith({ f1: ['F1O1'] })
  })

  it('should clear filters and revert label when CLEAR button was clicked - Single Filter', () => {
    render(
      <FilterChip
        filterList={[{ ...filterList[0], selectedOptions: ['F1O1'] }]}
        chipLabel='Filter1'
        applyFilters={mockApplyFilters}
        isAllFilters={false}
        key='filter1'
      />,
      { width: 1440 }
    )

    fireEvent.click(screen.getByTestId('Filter1'))

    expect(screen.getByRole('checkbox', { name: 'F1O1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'common.clear.label' }))
    fireEvent.click(screen.getByRole('button', { name: 'common.apply.label' }))

    expect(screen.queryByRole('checkbox', { name: 'F1O1' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Filter1' })).toBeTruthy()
    expect(screen.getByText(/arrow_drop_down/)).toBeTruthy()
    expect(mockApplyFilters).toHaveBeenCalledWith({ f1: [] })
  })

  it('should clear all filters and revert label when close button on chip was clicked - Single Filter', () => {
    render(
      <FilterChip
        filterList={[{ ...filterList[0], selectedOptions: ['F1O1'] }]}
        chipLabel='Filter1'
        applyFilters={mockApplyFilters}
        isAllFilters={false}
        key='filter1'
      />,
      { width: 1440 }
    )

    expect(screen.getByRole('checkbox', { name: 'F1O1' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Filter1' })).toBeNull()
    expect(screen.getByText(/close/)).toBeTruthy()

    fireEvent.click(screen.getByText(/close/))

    expect(screen.queryByRole('checkbox', { name: 'F1O1' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Filter1' })).toBeTruthy()
    expect(screen.getByText(/arrow_drop_down/)).toBeTruthy()
    expect(mockApplyFilters).toHaveBeenCalledWith({ f1: [] })
  })

  it('should render actions in appropriate order for ipad inside Bottom Sheet', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 1023 }
    )

    fireEvent.click(screen.getByTestId('Filters'))
    expect(screen.queryAllByRole('button')[1].textContent).toBe('common.clear.label')
    expect(screen.queryAllByRole('button')[2].textContent).toBe('common.apply.label')
  })

  it('should render actions in appropriate order for mobile inside Bottom Sheet', () => {
    render(
      <FilterChip
        filterList={filterList}
        chipLabel='Filters'
        applyFilters={noop}
        isAllFilters={true}
        key='all_filters'
      />,
      { width: 599 }
    )

    fireEvent.click(screen.getByTestId('Filters'))
    expect(screen.queryAllByRole('button')[1].textContent).toBe('common.apply.label')
    expect(screen.queryAllByRole('button')[2].textContent).toBe('common.clear.label')
  })

  it("should handle when filter was selected but apply wasn't - Single Filter", () => {
    render(
      <FilterChip
        filterList={[{ ...filterList[0] }]}
        chipLabel='Filter1'
        applyFilters={mockApplyFilters}
        isAllFilters={false}
        key='filter1'
      />,
      { width: 1440 }
    )

    fireEvent.click(screen.getByTestId('Filter1'))
    fireEvent.click(screen.getByTestId('checkbox-F1O1'))

    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    fireEvent.click(screen.getByTestId('Filter1'))
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
  })

  it("should handle when clear was clicked but apply wasn't - Single Filter", () => {
    render(
      <FilterChip
        filterList={[{ ...filterList[0], selectedOptions: ['F1O1'] }]}
        chipLabel='Filter1'
        applyFilters={mockApplyFilters}
        isAllFilters={false}
        key='filter1'
      />,
      { width: 1440 }
    )

    fireEvent.click(screen.getByTestId('Filter1'))

    expect(screen.getByRole('checkbox', { name: 'F1O1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'common.clear.label' }))
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    fireEvent.click(screen.getByTestId('Filter1'))
    expect(screen.getByRole('button', { name: 'common.apply.label' }).getAttribute('disabled')).toBeDefined()
    expect(screen.getByRole('button', { name: 'common.clear.label' }).getAttribute('disabled')).toBeNull()
  })
})
