import { render, fireEvent } from '@testing-library/react'
import '@element/react-button'
import { ButtonProps } from '@element/react-components'

import { Alert, AlertProps } from './Alert'

describe('Alert', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })
  it('should render successfully', () => {
    const { baseElement } = render(<Alert type='info' />)
    expect(baseElement).toBeTruthy()
  })

  it('should use default values when alert action button properties are not supplied', () => {
    const { baseElement } = render(<Alert type='info' />)

    const mockButton = baseElement.querySelector('button')
    expect(mockButton).toBeTruthy()

    const textContent: string = mockButton?.textContent ? mockButton?.textContent : ''
    const mockButtonProperties: ButtonProps = JSON.parse(textContent)
    expect(mockButtonProperties.variant).toBe('filled')
    expect(mockButtonProperties.className).toBe('text')
  })

  it('should use the provided alert action button properties', () => {
    const mockCallback = jest.fn()
    const alertProperties: AlertProps = {
      type: 'info',
      actionButtonProps: {
        label: 'button label',
        variant: 'outlined',
        onClick: mockCallback
      }
    }

    const { baseElement } = render(<Alert {...alertProperties} />)

    const mockButton = baseElement.querySelector('button')!
    expect(mockButton).toBeTruthy()

    const textContent: string = mockButton?.textContent ? mockButton?.textContent : ''
    const mockButtonProperties: ButtonProps = JSON.parse(textContent)
    expect(mockButtonProperties.label).toBe('button label')
    expect(mockButtonProperties.variant).toBe('outlined')

    fireEvent.click(mockButton)
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should use the Alerts variant when no variant is specified in the action button properties', () => {
    const alertProperties: AlertProps = {
      type: 'info',
      variant: 'outlined',
      actionButtonProps: {
        label: 'button label'
      }
    }

    const { baseElement } = render(<Alert {...alertProperties} />)

    const mockButton = baseElement.querySelector('button')!
    expect(mockButton).toBeTruthy()

    const textContent: string = mockButton?.textContent ? mockButton?.textContent : ''
    const mockButtonProperties: ButtonProps = JSON.parse(textContent)
    expect(mockButtonProperties.variant).toBe('outlined')
    expect(mockButtonProperties.label).toBe('button label')
  })

  it('should use the alert text color when action button className is not specified', () => {
    const alertProperties: AlertProps = {
      type: 'info',
      actionButtonProps: {
        label: 'button label'
      }
    }

    const { baseElement } = render(<Alert {...alertProperties} />)

    const mockButton = baseElement.querySelector('button')!
    expect(mockButton).toBeTruthy()

    const textContent: string = mockButton?.textContent ? mockButton?.textContent : ''
    const mockButtonProperties: ButtonProps = JSON.parse(textContent)
    expect(mockButtonProperties.className).toBe('text')
  })
})
