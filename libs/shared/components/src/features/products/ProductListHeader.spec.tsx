import { render, screen } from '@gc/utils'

import ProductListHeader from './ProductListHeader'

describe('ProductListHeader', () => {
  it('should render successfully for desktop', () => {
    const wrapper = render(
      <ProductListHeader icon='tune' count={2} crop='Corn' averagePrice={100} currencyIso='USD' />,
      { width: 1440 }
    )
    expect(screen.queryByText(/common.average_desktop.label/)).toBeTruthy()
    expect(screen.queryByText(/subtitle2/)).toBeDefined()
    expect(wrapper).toMatchSnapshot()
  })

  it('should render successfully for mobile', () => {
    const wrapper = render(
      <ProductListHeader icon='tune' count={2} crop='Corn' averagePrice={100} currencyIso='USD' />,
      { width: 599 }
    )
    expect(screen.queryByText(/common.average_mobile.label/)).toBeTruthy()
    expect(screen.queryByText(/subtitle1/)).toBeDefined()
    expect(wrapper).toMatchSnapshot()
  })
})
