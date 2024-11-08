import { render } from '@testing-library/react'

import ModalTopBar from './ModalTopBar'

describe('ModalTopBar', () => {
  it('should render title and back button successfully', () => {
    const { getByRole, getByText } = render(<ModalTopBar title='Modal Title' exitIconButtonProps={{ icon: 'back' }} />)
    expect(getByRole('button', { name: 'back' })).toBeDefined()
    expect(getByText('Modal Title')).toBeDefined()
  })

  it('should render trailing icon when provided', () => {
    const wrapper = render(<ModalTopBar title='Modal Title' trailingIconButtonProps={{ icon: 'search' }} />)
    expect(wrapper.getByRole('button', { name: 'search' })).toBeDefined()
    expect(wrapper).toMatchSnapshot()
  })

  it('should not render trailing icon button when trailingContent is provided', () => {
    const { queryByRole, queryByText } = render(
      <ModalTopBar title='Modal Title' trailingContent=<p>some</p> trailingIconButtonProps={{ icon: 'search' }} />
    )
    expect(queryByRole('button', { name: 'search' })).toBeNull()
    expect(queryByText('Some')).toBeDefined()
  })

  it('should not render title when topBarContent is provided', () => {
    const { getByText, queryByText } = render(<ModalTopBar title='Not Show' topBarContent=<p>Some</p> />)
    expect(getByText('Some')).toBeDefined()
    expect(queryByText('Not Show')).toBeNull()
  })
})
