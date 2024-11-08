import { fetchBaseQuery } from '@gc/api/client'
import { fetchLicFarmers, getLicFarmerSummary, getLicSingleFarmerDetails } from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const licApi = createApi({
  reducerPath: 'licApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'gcPortalConfig.services.licServiceUrl'
  }),
  endpoints: (builder) => ({
    getAllLicFarmers: fetchLicFarmers(builder),
    getLicFarmerSummary: getLicFarmerSummary(builder),
    getLicSingleFarmerDetails: getLicSingleFarmerDetails(builder)
  })
})

export const {
  useGetAllLicFarmersQuery,
  useGetLicFarmerSummaryQuery,
  useGetLicSingleFarmerDetailsQuery,
  useLazyGetLicSingleFarmerDetailsQuery
} = licApi

export default licApi
