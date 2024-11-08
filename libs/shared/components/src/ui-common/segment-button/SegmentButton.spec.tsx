import { render, fireEvent } from '@testing-library/react'
import SegmentButton from './SegmentButton'
import { noop } from 'lodash'

describe('SegmentButton', () => {
  const data = [
    { name: '$', value: '$' },
    { name: '%', value: '%' }
  ]
  it('should render successfully', () => {
    const { baseElement } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' />
    )
    expect(baseElement).toBeTruthy()
  })

  it('Snapshot test', () => {
    const { baseElement } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' />
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('renders the correct name prop', () => {
    const { getByText } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' onClick={noop} />
    )
    const dollar = getByText('$')
    expect(dollar).toBeTruthy()
    const percentage = getByText('%')
    expect(percentage).toBeTruthy()
  })

  it('handleClick', async () => {
    const handleClick = jest.fn()
    const { queryByText } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' onClick={handleClick} />
    )

    const button = queryByText('%')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render first button with border radius', () => {
    const { baseElement } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' />
    )
    expect(baseElement.getElementsByClassName('first').length).toBe(0)
  })
  it('should render last button with border radius', () => {
    const { baseElement } = render(
      <SegmentButton buttonProps={{ buttonSize: 'xsmall' }} data={data} selectedValue='$' />
    )
    expect(baseElement.getElementsByClassName('last').length).toBe(0)
  })
})
