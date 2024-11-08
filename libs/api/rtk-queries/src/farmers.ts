import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { CropZone, FarmerDetails, LicensedGrowerTotals, LicensedUnitTotals } from '@gc/types'
import { fetchStore, filterCropZone, getRoundedValueByPower, toUId } from '@gc/utils'

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

type LicensedUnitsResponse = {
  unit: LicensedUnitTotals[]
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

function transformLicensedUnits(response: LicensedUnitsResponse) {
  let licensedUnitCount = 0
  let unLicensedUnitCount = 0
  let unauthorizedUnitCount = 0

  response.unit?.forEach((item) => {
    licensedUnitCount += item.licensedUnit
    unLicensedUnitCount += item.unLicensedUnit
    unauthorizedUnitCount += item.unauthorizedUnit
  })

  return {
    licensedUnit: licensedUnitCount,
    unLicensedUnit: unLicensedUnitCount,
    unauthorizedUnit: unauthorizedUnitCount,
    totalUnits: getRoundedValueByPower(licensedUnitCount + unLicensedUnitCount + unauthorizedUnitCount)
  }
}

export function transformLicensedGrower(licensedGrowers: { people: LicensedGrowerTotals[] }[]) {
  let licensedPeopleCount = 0
  let unLicensedPeopleCount = 0
  let unauthorizedPeopleCount = 0

  licensedGrowers?.forEach((grower) => {
    grower.people.forEach((person) => {
      licensedPeopleCount += person.licensedPeople
      unLicensedPeopleCount += person.unLicensedPeople
      unauthorizedPeopleCount += person.unauthorizedPeople
    })
  })

  return {
    licensedPeople: licensedPeopleCount,
    unLicensedPeople: unLicensedPeopleCount,
    unauthorizedPeople: unauthorizedPeopleCount,
    totalFarmers: getRoundedValueByPower(licensedPeopleCount + unLicensedPeopleCount + unauthorizedPeopleCount)
  }
}

export function getSingleFarmerDetails(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<FarmerDetails, { growerSapId: string; growerIrdId: string }>({
    query: ({ growerSapId, growerIrdId }) => {
      const url =
        growerSapId && !growerSapId.startsWith('IRD')
          ? `/dealer/${growerSapId}/growerDetails`
          : `/dealer/${growerIrdId}/growerDetails?idtype=irdid`
      return { url }
    },
    transformResponse: (response: GrowerDetailsFarmer) => {
      return transformGrowerDetails(response)
    }
  })
}

export function getUnitsDetails(builder: EndpointBuilder<BaseQueryFn, string, 'acsMyAccountApi'>) {
  return builder.query<LicensedUnitTotals, void>({
    query: () => {
      const { sapAccountId = '' } = fetchStore('selectedAccount')
      return {
        url: '/farmers/licensedGrowerByUnit',
        params: {
          sapAccountId,
          businessId: 'CHANNEL'
        }
      }
    },
    transformResponse: (response: LicensedUnitsResponse) => {
      return transformLicensedUnits(response)
    }
  })
}
