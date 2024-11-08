import { render } from '@testing-library/react'
import { AddressInfo } from '@gc/types'
import Address from './Address'

describe('Address', () => {
  let addressInfo: AddressInfo
  beforeEach(() => {
    addressInfo = {
      addressee: 'CARL GREEN WAREHOUSE',
      line1: '2344 Test Address Dr',
      town: 'Kansas City',
      region: {
        countryIso: 'US',
        isocode: 'KS',
        isocodeShort: 'KS',
        name: 'Kansas'
      },
      postalCode: '66062'
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Address address={addressInfo} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render addressline 2 successfully, if passed', () => {
    addressInfo.line2 = 'Round Cr'
    const { baseElement } = render(<Address address={addressInfo} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render phone successfully, if passed', () => {
    addressInfo.phone = '574-556-2345'
    const { baseElement } = render(<Address address={addressInfo} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render with expected text style based on typography being passed', () => {
    const { container } = render(<Address address={addressInfo} typographyType='display4' />)
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--headline4').length).toBe(1)
  })

  it('should render with body2 text typograhy style by default', () => {
    const { container } = render(<Address address={addressInfo} />)
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--body2').length).toBe(1)
  })

  it('should render in expected style class if className is passed', () => {
    const { container } = render(<Address address={addressInfo} className='address_style' />)
    expect(container.getElementsByClassName('address_style').length).toBe(1)
  })
})
