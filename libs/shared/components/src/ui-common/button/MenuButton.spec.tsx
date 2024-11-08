import { render, screen } from '@testing-library/react'

import MenuButton from './MenuButton'

describe('MenuButton', () => {
  it('should render successfully with button', () => {
    const { container } = render(
      <MenuButton buttonLabel='More' listItems={[{ value: 'v1', label: 'V1', onClick: () => null }]} />
    )
    expect(screen.getAllByRole('button', { name: 'More arrow_drop_down' }).length).toBe(1)
    expect(container.getElementsByTagName('i').length).toBe(1)
    expect(container.getElementsByTagName('i')[0].innerHTML).toBe('arrow_drop_down')
  })

  it('should render successfully with icon button', () => {
    const { container } = render(
      <MenuButton icon='more_icon' listItems={[{ value: 'v1', label: 'V1', onClick: () => null }]} />
    )
    expect(container.getElementsByTagName('i').length).toBe(1)
    expect(container.getElementsByTagName('i')[0].innerHTML).toBe('more_icon')
  })
})
