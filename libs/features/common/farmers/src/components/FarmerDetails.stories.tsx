import { myCropPortalConfig, seedsmanPortalConfig } from '@gc/shared/env'

import { mockFarmerDetailsAngell } from '../mocks'
import FarmerDetails from './FarmerDetails'

export default {
  title: 'Components/FarmerDetails',
  component: FarmerDetails
}

export const MyCrop = {
  args: {
    data: mockFarmerDetailsAngell,
    fields: myCropPortalConfig.farmersModule.farmerDetailFields
  }
}

export const SeedsmanSource = {
  args: {
    data: mockFarmerDetailsAngell,
    fields: seedsmanPortalConfig.farmersModule.farmerDetailFields
  }
}
