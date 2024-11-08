import { FarmerDetails } from '@gc/types'

const FARM_NAME = 'ANGELL SEED FARM'

export const mockFarmerDetailsAngell = {
  dealerName: FARM_NAME,
  dealerSapId: '123',
  farmName: FARM_NAME,
  growerSapId: '0009138486',
  cyOrder: true,
  growerName: 'TestF TestL',
  firstName: 'TestF',
  lastName: 'TestL',
  licenseStatus: 'Not Licensed',
  streetAddress: '86381 320TH ST ',
  city: 'BLOOMING PRAIRIE',
  state: 'MN',
  zipCode: '55917-8028',
  county: 'STEELE',
  phoneNumber: '507-583-7581',
  email: 'roger@bayer.com',
  growerIrdId: '123456',
  gln: '1100027655029',
  cornZone: 'ZONE 2',
  cropZones: [
    {
      crop: 'soy',
      cyZone: 'A',
      cyReassigned: 'B',
      pyZone: 'C',
      pyReassigned: 'D'
    }
  ]
} as FarmerDetails
