import { render } from '@testing-library/react'

import FilterBar from './FilterBar'
import { Filter } from '@gc/types'
import { noop } from 'lodash'

const translations: { [key: string]: string } = {
  'common.all_filters.label': 'All Filters',
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

describe('FilterBar', () => {
  const filterList: Filter[] = [
    { category: 'f1', title: 'Filter1', selectedOptions: [], options: ['F1O1', 'F1O2'] },
    { category: 'f2', title: 'Filter2', selectedOptions: [], options: ['F2O1', 'F2O2'] }
  ]
  it('should render successfully', () => {
    const { baseElement } = render(<FilterBar filterList={filterList} applyFilters={noop} />)
    expect(baseElement).toBeTruthy()
  })

  // it('should match all UX requirements by default', () => {
  //   const wrapper = render(<FilterBar filterList={filterList} applyFilters={noop} />)
  //   expect(wrapper).toMatchSnapshot()
  // })

  it('should match one all filters chip', () => {
    const { queryAllByRole, queryAllByTestId } = render(<FilterBar filterList={filterList} applyFilters={noop} />)
    expect(queryAllByRole('row')).toHaveLength(3)
    expect(queryAllByTestId('All Filters')).toHaveLength(1)
    expect(queryAllByTestId('Filter1')).toHaveLength(1)
    expect(queryAllByTestId('Filter2')).toHaveLength(1)
  })

  it('should render not render all filters if only one is available', () => {
    const { queryAllByRole, queryAllByTestId } = render(<FilterBar filterList={[filterList[0]]} applyFilters={noop} />)
    expect(queryAllByRole('row')).toHaveLength(1)
    expect(queryAllByTestId('All Filters')).toHaveLength(0)
    expect(queryAllByTestId('Filter1')).toHaveLength(1)
  })
})
