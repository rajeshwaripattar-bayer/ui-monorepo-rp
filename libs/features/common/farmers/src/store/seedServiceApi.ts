import { fetchBaseQuery } from '@gc/api/client'
import { getFarmerDetailsByYear, getFarmerOrderDetailsNational } from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const acsCommonApi = createApi({
  reducerPath: 'seedServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'gcPortalConfig.services.seedServiceUrl'
  }),
  endpoints: (builder) => ({
    getFarmerDetailsByYear: getFarmerDetailsByYear(builder),
    getFarmerOrderDetailsNational: getFarmerOrderDetailsNational(builder)
  })
})

export const { useGetFarmerDetailsByYearQuery, useGetFarmerOrderDetailsNationalQuery } = acsCommonApi

export default acsCommonApi
