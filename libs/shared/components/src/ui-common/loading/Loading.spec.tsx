import { render } from '@gc/utils'
import { screen } from '@testing-library/react'

import { Loading } from './Loading'

describe('Loading', () => {
  it('should render successfully', () => {
    const wrapper = render(<Loading />)
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render label', () => {
    const { getByText } = render(<Loading label='My Label' />, { width: 1440 })
    expect(getByText('My Label')).toBeTruthy()
  })

  it('Should render progressbar', () => {
    const { queryByRole } = render(<Loading label='My Label' />, { width: 1440 })
    expect(screen.getByRole('progressbar')).toBeDefined()
  })
})
