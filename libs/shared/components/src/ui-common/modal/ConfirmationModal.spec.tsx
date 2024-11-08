import { render, fireEvent } from '@testing-library/react'

import ConfirmationModal from './ConfirmationModal'

describe('ConfirmationModal', () => {
  it('should render title, message, primary and dismissive buttons successfully', () => {
    const { queryByTestId, queryByText } = render(
      <ConfirmationModal
        open={true}
        handleClose={jest.fn()}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm' }}
        dismissiveButtonProps={{ text: 'Cancel' }}
        message='This is confirmation modal test'
        onConfirmation={jest.fn()}
      />
    )
    expect(queryByTestId('dismissiveButton')).toBeTruthy()
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByTestId('messageText')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    expect(queryByText('Confirm')).toBeDefined()
    expect(queryByText('Cancel')).toBeDefined()
    expect(queryByText('This is confirmation modal test')).toBeDefined()
  })

  it('should not render dismissive button', () => {
    const { queryByTestId, queryByText } = render(
      <ConfirmationModal
        open={true}
        handleClose={jest.fn()}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm' }}
        message='This is confirmation modal test'
        onConfirmation={jest.fn()}
      />
    )
    expect(queryByTestId('dismissiveButton')).toBeFalsy()
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByTestId('messageText')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    expect(queryByText('Confirm')).toBeDefined()
    expect(queryByText('Cancel')).toBeDefined()
    expect(queryByText('This is confirmation modal test')).toBeDefined()
  })
  it('should render primary button based on the variant passed', () => {
    const { container, queryByTestId, queryByText } = render(
      <ConfirmationModal
        open={true}
        handleClose={jest.fn()}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm', variant: 'filled' }}
        message='This is confirmation modal test'
        onConfirmation={jest.fn()}
      />
    )
    expect(queryByTestId('dismissiveButton')).toBeFalsy()
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByTestId('messageText')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    expect(container.getElementsByClassName('lmnt-button--filled-danger').length).toBe(1)
  })

  it('should render primary button based on the variant and theme color passed', () => {
    const { container, queryByTestId, queryByText } = render(
      <ConfirmationModal
        open={true}
        handleClose={jest.fn()}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm', variant: 'filled', themeColor: 'primary' }}
        message='This is confirmation modal test'
        onConfirmation={jest.fn()}
      />
    )
    expect(queryByTestId('dismissiveButton')).toBeFalsy()
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByTestId('messageText')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    expect(container.getElementsByClassName('lmnt-button--filled-primary').length).toBe(1)
  })

  it('check for Primary button onClick event being triggered ', () => {
    const mockOnConfirmation = jest.fn()
    const { queryByTestId, queryByText, getByRole } = render(
      <ConfirmationModal
        open={true}
        handleClose={jest.fn()}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm' }}
        message='This is confirmation modal test'
        onConfirmation={mockOnConfirmation}
      />
    )
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    fireEvent.click(getByRole('button', { name: 'Confirm' }))

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1)
  })

  it('check for onClose event to be triggered on click of primary button click ', () => {
    const mockOnConfirmation = jest.fn()
    const mockOnClose = jest.fn()
    const { queryByTestId, queryByText, getByRole } = render(
      <ConfirmationModal
        open={true}
        handleClose={mockOnClose}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm' }}
        message='This is confirmation modal test'
        onConfirmation={mockOnConfirmation}
      />
    )
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    fireEvent.click(getByRole('button', { name: 'Confirm' }))

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('check for Dismissive button onClick event being triggered ', () => {
    const mockOnClose = jest.fn()
    const { queryByTestId, queryByText, getByRole } = render(
      <ConfirmationModal
        open={true}
        handleClose={mockOnClose}
        title='Modal Test'
        primaryButtonProps={{ text: 'Confirm' }}
        dismissiveButtonProps={{ text: 'Cancel' }}
        message='This is confirmation modal test'
        onConfirmation={jest.fn()}
      />
    )
    expect(queryByTestId('primaryButton')).toBeTruthy()
    expect(queryByText('Modal Test')).toBeDefined()
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
