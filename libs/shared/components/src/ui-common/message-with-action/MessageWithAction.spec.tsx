import { render, fireEvent } from '@testing-library/react'

import MessageWithAction from './MessageWithAction'

describe('Message with Action', () => {
  it('should render successfully', () => {
    const { container, getByText } = render(<MessageWithAction messageHeader='No Data Found' />)
    expect(getByText('No Data Found')).toBeTruthy()
    expect(container.getElementsByClassName('mdc-typography--subtitle1-bold').length).toBe(1)
  })

  it('should display message description if related props was passed', () => {
    const { container, getByText } = render(
      <MessageWithAction messageHeader='No Data Found' messageDescription='Please create new data' />
    )
    expect(getByText('Please create new data')).toBeTruthy()
    expect(container.getElementsByClassName('mdc-typography--body2').length).toBe(1)
  })

  it('should not display button when related props are not passed', () => {
    const { queryByRole } = render(<MessageWithAction messageHeader='No Data Found' />)
    expect(queryByRole('button')).toBeFalsy()
  })

  it('should render button (enabled by default) if related props was passed', () => {
    const { queryByRole, getByText } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        buttonProps={{ text: 'New Quote', variant: 'text', onClick: () => {} }}
      />
    )
    expect(queryByRole('button', { name: 'New Quote' })).toBeDefined()
    expect(getByText('New Quote').closest('button')?.disabled).toBeFalsy() //check if button is enabled
  })

  it('should render specific variant of button based on props being passed', () => {
    const { container, queryByRole } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        buttonProps={{ text: 'New Quote', variant: 'text', onClick: () => {} }}
      />
    )
    expect(queryByRole('button', { name: 'New Quote' })).toBeDefined()
    expect(container.getElementsByClassName('lmnt-button--text-primary').length).toBe(1)
  })

  it('should render button in disabled mode when appropriate props being passed', () => {
    const { getByText, queryByRole } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        buttonProps={{ text: 'New Quote', variant: 'text', disabled: true, onClick: () => {} }}
      />
    )
    expect(queryByRole('button', { name: 'New Quote' })).toBeDefined()
    expect(getByText('New Quote').closest('button')?.disabled).toBeTruthy()
  })
  it('check for button onClick event being triggered', () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        buttonProps={{
          text: 'New Quote',
          variant: 'text',
          onClick: mockOnClick
        }}
      />
    )

    fireEvent.click(getByRole('button', { name: 'New Quote' }))

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
  it('should render icon if related props was passed', () => {
    const { container, getByText } = render(
      <MessageWithAction messageHeader='No Data Found' iconProps={{ icon: 'fingerprint' }} />
    )
    expect(container.getElementsByClassName('material-icons').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-icon').length).toBe(1)
    expect(getByText('fingerprint')).toBeTruthy()
  })

  it('should render specific variant of icon if related props was passed', () => {
    const { container, getByText } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        iconProps={{ icon: 'fingerprint', variant: 'filled-secondary' }}
      />
    )
    expect(container.getElementsByClassName('material-icons').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-icon').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-icon--fill-secondary').length).toBe(1)
    expect(getByText('fingerprint')).toBeTruthy()
  })

  it('should render specific variant  of icon with specific css class if related props was passed', () => {
    const { container, getByText } = render(
      <MessageWithAction
        messageHeader='No Data Found'
        iconProps={{ icon: 'fingerprint', variant: 'filled-secondary', className: 'lmnt-theme-secondary-200-bg' }}
      />
    )
    expect(container.getElementsByClassName('material-icons').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-icon').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-icon--fill-secondary').length).toBe(1)
    expect(container.getElementsByClassName('lmnt-theme-secondary-200-bg').length).toBe(1)
    expect(getByText('fingerprint')).toBeTruthy()
  })

  it('should not render icon if related props are not passed', () => {
    const { container } = render(<MessageWithAction messageHeader='No Data Found' />)
    expect(container.getElementsByClassName('material-icons').length).toBe(0)
    expect(container.getElementsByClassName('lmnt-icon').length).toBe(0)
  })
})
