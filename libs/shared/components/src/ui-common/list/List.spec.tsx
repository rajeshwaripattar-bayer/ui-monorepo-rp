import { render } from '@testing-library/react'
import List from './List'

describe('List', () => {
  const listItems = [
    {
      trailingBlock: '01/08/2024',
      overlineText: 'Buyer_offer',
      primaryText: 'CARL GREEN',
      secondaryText: 'SQ-20240126-094739 1 products'
    },
    {
      trailingBlock: '01/08/2024',
      overlineText: 'Buyer_offer',
      primaryText: 'WeGO GRAND',
      secondaryText: 'SQ-20240126-094739 1 products'
    }
  ]
  it('should render successfully', () => {
    const { baseElement } = render(<List items={listItems} />)
    expect(baseElement).toBeTruthy()
  })

  it('Snapshot test', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render list with 100% width', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement.getElementsByClassName('full-width').length).toBe(1)
  })

  it('should render overline component successfully', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement.getElementsByClassName('mdc-list-item__overline-text').length).toBe(2)
  })
  it('should render primary component successfully', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement.getElementsByClassName('mdc-list-item__primary-text').length).toBe(2)
  })
  it('should render secondary component successfully', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement.getElementsByClassName('mdc-list-item__secondary-text').length).toBe(2)
  })
  it('should render meta component successfully', () => {
    const { baseElement } = render(<List items={listItems} trailingBlockType='meta' />)
    expect(baseElement.getElementsByClassName('mdc-list-item__end').length).toBe(2)
  })
})
