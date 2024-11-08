import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProductHeader from './ProductHeader'
const mockPortalConfig = {
  gcPortalConfig: {
    crops: ['Corn', 'Soybeans'],
    cropList: [
      { cropCode: 'seed_corn', cropName: 'Corn' },
      { cropCode: 'seed_soybean', cropName: 'Soybeans' }
    ]
  }
}
jest.mock('@gc/hooks', () => ({
  usePortalConfig: () => {
    return mockPortalConfig
  },
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 5
}))

describe('ProductHeader', () => {
  it('should render successfully', () => {
    const user = userEvent.setup()
    const mockCloseOnClick = jest.fn()
    const product = {
      acronymID: '202-58SSPRIB',
      available: 9998,
      brandCode: 'CL',
      brandName: 'Channel bio LLC',
      code: '000000000089231477',
      crop: 'Corn',
      description: '202-58SSPRIB 40U BOX BAS500 N-B',
      favorite: false,
      name: '202-58SSPRIB 40U BOX BAS500 N-B',
      packageDescription: '40U',
      packageSizeCode: '29',
      packageType: 'SP',
      price: {
        currencyIso: 'USD',
        currencySymbol: '$',
        value: 394
      },
      salesUnitOfMeasure: 'SSU',
      shortPackageType: '15',
      specialTreatmentCode: 'B7',
      specialTreatmentDescription: 'P500 + B360 + BASE',
      trait: 'SDW'
    }
    const actionProps = {
      icon: 'close',
      onClick: mockCloseOnClick
    }
    const { baseElement, getAllByText } = render(
      <ProductHeader product={product} actionProps={actionProps} minDiscount={20} maxDiscount={50} />
    )
    expect(baseElement).toBeTruthy()
  })
})
