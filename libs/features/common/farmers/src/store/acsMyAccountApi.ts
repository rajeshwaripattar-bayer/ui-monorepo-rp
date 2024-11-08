import { fetchBaseQuery } from '@gc/api/client'
import { getFarmerOrderDetailsChannel, getUnitsDetails } from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const acsMyAccountApi = createApi({
  reducerPath: 'acsMyAccountApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'gcPortalConfig.services.acsMyAccountUrl'
  }),
  endpoints: (builder) => ({
    getFarmerOrderDetailsChannel: getFarmerOrderDetailsChannel(builder),
    getUnitsDetails: getUnitsDetails(builder)
  })
})

export const { useGetFarmerOrderDetailsChannelQuery, useGetUnitsDetailsQuery } = acsMyAccountApi

export default acsMyAccountApi
