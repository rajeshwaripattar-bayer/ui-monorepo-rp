import { render, fireEvent } from '@testing-library/react'

import BottomSheet from './BottomSheet'

describe('BottomSheet', () => {
  it('should render successfully', () => {
    const mockSetOpen = jest.fn()
    const wrapper = render(
      <BottomSheet open={true} onClose={mockSetOpen} title='Filter' content={<p>Main content comes here!!</p>} />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('should render footer when its passed', () => {
    const mockSetOpen = jest.fn()
    const { getByTestId } = render(
      <BottomSheet
        open={true}
        onClose={mockSetOpen}
        title='Filter'
        content={<p>Main content comes here!!</p>}
        footer={<p>Footer content comes here!!</p>}
      />
    )
    expect(getByTestId('footer')).toBeDefined()
  })

  it('should call appropriate function when closed', () => {
    const mockSetOpen = jest.fn()
    const { getByRole } = render(
      <BottomSheet
        open={true}
        onClose={mockSetOpen}
        title='Filter'
        content={<p>Main content comes here!!</p>}
        footer={<p>Footer content comes here!!</p>}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Dismiss' }))
    expect(mockSetOpen).toHaveBeenCalledWith(false)
  })
})
