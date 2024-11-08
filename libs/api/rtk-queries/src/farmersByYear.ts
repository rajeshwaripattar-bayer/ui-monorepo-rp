import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { Account, CropZone, FarmerDetails, FarmerId, LicensedGrowerTotals } from '@gc/types'
import { fetchStore, filterCropZone, getBrandCodeFromFamily, nameToObject, toUId } from '@gc/utils'

import { transformLicensedGrower } from './farmers'
import chunk from 'lodash/chunk'

type CustomerDetailsFarmer = {
  farmName: string
  growerName: string
  irdId: string
  licenseNumber: string
  licenseStatus: string
  growerSapAccountId: string
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
  cyOrder: boolean
  dealerSapId: string
  crtva: string
}

type CustomerDetailsResponse = {
  dealers: {
    dealerName: string
    growers: CustomerDetailsFarmer[]
  }[]
  licensedGrowers: {
    people: LicensedGrowerTotals[]
  }[]
}

type FarmerIdsResponse = {
  customerResponseEntityList?: FarmerId[]
}

function transformCustomerDetails(farmerDetails: CustomerDetailsResponse) {
  return (
    farmerDetails?.dealers?.flatMap((dealer) => {
      return (
        dealer.growers?.map((grower) => ({
          farmName: grower.farmName,
          growerName: grower.growerName,
          ...nameToObject(grower.growerName),
          growerSapId: grower.growerSapAccountId,
          growerIrdId: grower.irdId,
          growerUId: toUId(grower.growerSapAccountId, grower.irdId),
          licenseStatus: grower.licenseStatus,
          gln: Array.isArray(grower.gln) ? grower.gln.join(', ') : grower.gln,
          city: grower.city,
          state: grower.state,
          zipCode: grower.zipCode,
          streetAddress: grower.streetAddress,
          county: grower.county,
          phoneNumber: grower.phoneNumber,
          email: grower.email,
          licensedByAug31: grower.licensedByAug31,
          cyOrder: grower.cyOrder,
          dealerName: dealer.dealerName,
          dealerSapId: grower.dealerSapId,
          crtva: grower.crtva,
          cornZone: grower.cornZone,
          cropZones: filterCropZone(grower.cropZones)
        })) || []
      )
    }) || []
  )
}

export function getFiscalYear(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<string, void>({
    query: () => {
      const { brandFamily } = fetchStore('domainDef').gcPortalConfig
      const brandFamilyCode = getBrandCodeFromFamily(brandFamily)
      const lob = fetchStore('selectedAccount').lob.toUpperCase()
      return {
        url: '/CurrentList',
        params: {
          brand: brandFamilyCode,
          country: 'US',
          lob
        }
      }
    },
    transformResponse: (response: { CurrentList: { fyLabel: string; dateRangeType: string }[] }) => {
      const lob = fetchStore('selectedAccount').lob.toLowerCase()
      let fyLabel: string = ''
      if (lob === 'lic') {
        fyLabel = response.CurrentList?.filter((e) => e?.dateRangeType?.toUpperCase() === 'REPORTING')[0]?.fyLabel
      } else {
        fyLabel = response.CurrentList?.[0]?.fyLabel
      }
      return fyLabel?.slice(2, 6) || ''
    }
  })
}

export function getFarmerIdsByYear(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<FarmerId[], { dealerHierarchySapIds: string[] }>({
    query({ dealerHierarchySapIds }) {
      const body = dealerHierarchySapIds
      return {
        url: `/getCustomerIdListBySAPIds`,
        method: 'POST',
        responseHandler: 'content-type',
        body
      }
    },
    transformResponse: (response: FarmerIdsResponse) => {
      return response?.customerResponseEntityList || ([] as FarmerId[])
    }
  })
}

export function getFarmerDetailsByYear(builder: EndpointBuilder<BaseQueryFn, string, 'seedServiceApi'>) {
  return builder.query<
    { farmerDetails: FarmerDetails[]; licensedGrowerTotals: LicensedGrowerTotals },
    { fiscalYear: string; farmerIds: FarmerId[]; dealerAccounts: Account[]; dealerHierarchySapIds: string[] }
  >({
    async queryFn(
      { fiscalYear, farmerIds, dealerAccounts, dealerHierarchySapIds },
      _queryApi,
      _extraOptions,
      fetchWithBQ
    ) {
      try {
        const bodyBase = {
          sapAccountIdList: [] as string[],
          fiscalYear,
          growerIdList: [] as FarmerId[],
          dealers: dealerAccounts.map((dealerAccount) => ({
            dealerName: dealerAccount.accountName,
            dealerSapId: dealerAccount.sapAccountId
          })),
          includeClosedAccounts: true,
          debug: true
        }

        const dealerHierarchySapIdsChunk = chunk(dealerHierarchySapIds, 30)
        const detailPromises: Promise<{ data: CustomerDetailsResponse }>[] = []

        dealerHierarchySapIdsChunk.forEach((ch) => {
          const farmerIdsChunk: FarmerId[] = farmerIds.filter((e) => ch.includes(e.dealerSAPId))
          const updatedBody = { ...bodyBase, sapAccountIdList: ch, growerIdList: farmerIdsChunk }
          const result = fetchWithBQ({
            url: `/farmers/customerDetailsList`,
            method: 'POST',
            body: updatedBody
          }) as Promise<{ data: CustomerDetailsResponse }>
          detailPromises.push(result)
        })

        const resolvedDetailsPromises = await Promise.all(detailPromises)
        const finalData: CustomerDetailsResponse[] = []
        resolvedDetailsPromises.map((e) => {
          finalData.push(e.data)
        })

        const transformedData = {
          farmerDetails: finalData.flatMap((e) => transformCustomerDetails(e)),
          licensedGrowerTotals: transformLicensedGrower(finalData.flatMap((e) => e?.licensedGrowers || []))
        }

        return {
          data: transformedData
        }
      } catch (error) {
        return { error }
      }
    }
  })
}
