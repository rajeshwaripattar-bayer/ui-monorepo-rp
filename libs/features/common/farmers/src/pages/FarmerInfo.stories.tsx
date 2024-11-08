import { mockFarmerDetailsAngell } from '../mocks'
import FarmerInfo from './FarmerInfo'

export default {
  title: 'Pages/FarmerInfo',
  component: FarmerInfo
}

export const Default = {
  args: {
    initialEntries: [
      { pathname: '/my-farmers' },
      { pathname: '/farmer-info', state: { farmer: [mockFarmerDetailsAngell] } }
    ]
  }
}
