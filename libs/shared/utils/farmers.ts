import { CropZone, DomainDef, FarmerDetails } from '@gc/types'
import { fetchStore } from './module'

export const getAccountName = (farmerDetail: FarmerDetails) => {
  return farmerDetail?.farmName || farmerDetail?.growerName
}

export const checkFarmerDetails = (farmerDetails: FarmerDetails) => {
  const requiredFields = [
    'growerSapId',
    'growerIrdId',
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'phoneNumber',
    'email'
  ]
  return requiredFields.every((key: string) => farmerDetails[key as keyof FarmerDetails])
}

export const filterCropZone = (cropZones: CropZone[]) => {
  const {
    gcPortalConfig: { crops }
  } = fetchStore('domainDef') as DomainDef
  return crops ? cropZones?.filter((cz) => crops.includes(cz.crop?.toLowerCase())) : cropZones
}
