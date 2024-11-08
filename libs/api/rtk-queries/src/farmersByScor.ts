import { fetchStore, filterCropZone, toUId } from '@gc/utils'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { FarmerDetails, LicensedGrowerTotals, CropZone } from '@gc/types'

import { transformLicensedGrower } from './farmers'

type ScorListFarmer = {
  farmName: string
  growerName: string
  licenseNumber: string
  licenseStatus: string
  sapAccountId: string
  gln: string[] | string
  city: string
  state: string
  zipCode: string
  firstName: string
  lastName: string
  streetAddress: string
  licensedByAug31: string
  county: string
  phoneNumber: string
  email: string
  cornZone: string
  cropZones: CropZone[]
  cyOrder: boolean
}

type ScorListResponse = {
  growers: ScorListFarmer[]
  licensedGrowers: {
    people: LicensedGrowerTotals[]
  }[]
}

function transformScorList(response: ScorListResponse) {
  return (
    response.growers?.map((grower) => ({
      farmName: grower.farmName,
      growerName: grower.growerName,
      firstName: grower.firstName,
      lastName: grower.lastName,
      growerSapId: grower.sapAccountId?.toString() ?? '',
      growerIrdId: grower.licenseNumber,
      growerUId: toUId(grower.sapAccountId?.toString() ?? '', grower.licenseNumber),
      licenseStatus: grower.licenseStatus,
      gln: Array.isArray(grower.gln) ? grower.gln.join(', ') : grower.gln,
      city: grower.city,
      state: grower.state,
      zipCode: grower.zipCode,
      streetAddress: grower.streetAddress,
      licensedByAug31: grower.licensedByAug31,
      county: grower.county,
      phoneNumber: grower.phoneNumber,
      email: grower.email,
      cyOrder: grower.cyOrder || false,
      cornZone: grower.cornZone,
      cropZones: filterCropZone(grower.cropZones)
    })) || []
  )
}

export function getFarmerDetailsByScor(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<{ farmerDetails: FarmerDetails[]; licensedGrowerTotals: LicensedGrowerTotals }, void>({
    query() {
      const { sapAccountId } = fetchStore('selectedAccount')
      return {
        url: `/scorList/${sapAccountId}`
      }
    },
    transformResponse: (response: ScorListResponse) => {
      return {
        farmerDetails: transformScorList(response),
        licensedGrowerTotals: transformLicensedGrower(response.licensedGrowers)
      }
    }
  })
}
