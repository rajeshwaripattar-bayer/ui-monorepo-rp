import { render } from '@testing-library/react'

import AddressCardMobile from './AddressCardMobile'
import { AddressInfo } from '@gc/types'
import { ReactNode } from 'react'
import { TypoDisplay } from '@element/react-typography'

describe('AddressCard', () => {
  let addressInfo: AddressInfo
  let title: ReactNode | string
  beforeEach(() => {
    title = 'Ship From'
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
    const { baseElement } = render(<AddressCardMobile title={title} address={{ addressInfo }} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render title with typography of subtitle 1 by default', () => {
    const { container } = render(<AddressCardMobile title={title} address={{ addressInfo }} />)
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--subtitle1').length).toBe(1)
  })

  it('should render title with expected typography, when passed as reactNode', () => {
    title = <TypoDisplay level={3}>{title}</TypoDisplay>
    const { container } = render(<AddressCardMobile title={title} address={{ addressInfo }} />)
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--headline3').length).toBe(1)
  })

  it('should render address with typography of body 2 by default', () => {
    const { container } = render(<AddressCardMobile title={title} address={{ addressInfo }} />)
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--body2').length).toBe(1)
  })

  it('should render address with typography that is passed as the property', () => {
    const { container } = render(
      <AddressCardMobile title={title} address={{ addressInfo, typographyType: 'display4' }} />
    )
    expect(container.getElementsByClassName('mdc-typography lmnt mdc-typography--headline4').length).toBe(1)
  })
})
