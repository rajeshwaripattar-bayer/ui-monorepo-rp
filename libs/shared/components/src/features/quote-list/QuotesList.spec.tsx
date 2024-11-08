import { render } from '@gc/utils'

import QuotesList from './QuotesList'

describe('QuotesList', () => {
  it('Should render component for Desktop', () => {
    const wrapper = render(<QuotesList />, { width: 1440 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 1440', () => {
    const wrapper = render(<QuotesList />, { width: 1023 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render create quote button for Desktop', () => {
    const { queryByRole } = render(<QuotesList />, { width: 1440 })
    expect(queryByRole('button', { name: 'Create Quote' })).toBeDefined()
  })

  it('Should render search button for Mobile', () => {
    const { queryByRole } = render(<QuotesList />, { width: 1023 })
    expect(queryByRole('button', { name: 'search' })).toBeDefined()
  })

  it('Should render Table for Desktop', () => {
    const { queryByRole } = render(<QuotesList />, { width: 1024 })
    expect(queryByRole('Table')).toBeDefined()
  })

  it('Should not render Table for Mobile', () => {
    const { queryByRole } = render(<QuotesList />, { width: 1023 })
    expect(queryByRole('Table')).toBeFalsy()
  })
})
