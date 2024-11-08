import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { CropZone, FarmerDetails } from '@gc/types'
import { fetchStore, filterCropZone, nameToObject, toUId } from '@gc/utils'

type CustomerDetailsFarmer = {
  addressLine: string
  city: string
  country: string
  email: string
  firstName: string
  gln: string[] | string
  lastName: string
  licenseStatus: string
  licensedByAug31: string
  name: string
  phone: string
  sapAccountId: string
  state: string
  technologyId: string
  zipCode: string
  zones: CropZone[]
}

type CustomerDetailsResponse = {
  purchasers: CustomerDetailsFarmer[]
  sapAccountId: string
  totalCount: number
  updateTimestamp: string
}

type GrowerSummaryDetails = {
  cropDescription: string
  product: string
  currentYearReportedGpos: number
  priorYearReportedGpos: number
  priorYearMinus1ReportedGpos: number
}

type CropTotals = {
  crop: string
  currentYearReportedGpos: number
  priorYearMinus1ReportedGpos: number
  priorYearReportedGpos: number
}

type GrowerOrderSummary = {
  growerSummaryDetails: GrowerSummaryDetails[]
  cropTotals: CropTotals[]
}

type GrowerDetailsFarmer = {
  accountName: string
  irdId: string
  licenseId: string
  licenseStatus: string
  sapAccountId: string
  gln: string[] | string
  city: string
  state: string
  zipCode: string
  streetAddress: string
  licensedByAug31: string
  county: string
  phoneNumber: string
  email: string
  cornZone: string
  cropZones: CropZone[]
}

function transformCustomerDetails(farmerDetails: CustomerDetailsResponse | undefined) {
  if (!farmerDetails) return []
  const { sapAccountId: dealerSapId = '', accountName: dealerName } = fetchStore('selectedAccount')
  return (
    farmerDetails?.purchasers?.map((grower) => ({
      farmName: grower.name,
      growerName: grower.name,
      ...nameToObject(grower.name),
      growerSapId: grower.sapAccountId,
      growerIrdId: grower.technologyId,
      growerUId: toUId(grower.sapAccountId, grower.technologyId),
      licenseStatus: grower.licenseStatus,
      gln: Array.isArray(grower.gln) ? grower.gln.join(', ') : grower.gln,
      city: grower.city,
      state: grower.state,
      zipCode: grower.zipCode,
      streetAddress: grower.addressLine,
      phoneNumber: grower.phone,
      email: grower.email,
      licensedByAug31: grower.licensedByAug31,
      dealerName: dealerName,
      dealerSapId: dealerSapId,
      cropZones: filterCropZone(grower.zones)
    })) || []
  )
}

function transformGrowerDetails(response: GrowerDetailsFarmer) {
  return {
    farmName: response.accountName,
    growerSapId: response.sapAccountId,
    growerIrdId: response.irdId,
    growerUId: toUId(response.sapAccountId, response.irdId),
    licenseStatus: response.licenseStatus,
    gln: Array.isArray(response.gln) ? response.gln.join(', ') : response.gln,
    city: response.city,
    state: response.state,
    zipCode: response.zipCode,
    streetAddress: response.streetAddress,
    licensedByAug31: response.licensedByAug31,
    county: response.county,
    phoneNumber: response.phoneNumber,
    email: response.email,
    cornZone: response.cornZone,
    cropZones: filterCropZone(response.cropZones)
  }
}

export function fetchLicFarmers(builder: EndpointBuilder<BaseQueryFn, string, 'licApi'>) {
  return builder.query<any, {}>({
    query: ({}) => {
      const { sapAccountId = '' } = fetchStore('selectedAccount')
      return {
        url: '/purchaser-list',
        params: { sapId: sapAccountId }
      }
    },
    transformResponse: (response: CustomerDetailsResponse) => {
      return transformCustomerDetails(response)
    }
  })
}

export function getLicFarmerSummary(builder: EndpointBuilder<BaseQueryFn, string, 'licApi'>) {
  return builder.query<GrowerOrderSummary, { dealerSapId: string; growerSapId: string }>({
    query: ({ dealerSapId, growerSapId }) => {
      return {
        url: '/grower-summary',
        params: { sapId: dealerSapId, growerAccountIrdId: growerSapId }
      }
    }
  })
}

export function getLicSingleFarmerDetails(builder: EndpointBuilder<BaseQueryFn, string, 'licApi'>) {
  return builder.query<FarmerDetails, { growerSapId: string; growerIrdId: string }>({
    query: ({ growerSapId, growerIrdId }) => {
      return {
        url: '/grower-details',
        params: { sapId: growerSapId, growerIrdId }
      }
    },
    transformResponse: (response: GrowerDetailsFarmer) => {
      return transformGrowerDetails(response)
    }
  })
}
