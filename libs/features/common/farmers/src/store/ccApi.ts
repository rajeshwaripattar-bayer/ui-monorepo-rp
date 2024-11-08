import { axiosBaseQuery } from '@gc/api/client'
import { injectDeliveriesEndpoints, injectOrdersEndpoints, injectQuotesEndpoints } from '@gc/redux-store'
import { getFarmersQuery } from '@gc/rtk-queries'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'
import { createApi } from '@reduxjs/toolkit/query/react'

const ccApi = createApi({
  reducerPath: 'ccApi',
  baseQuery: axiosBaseQuery({
    baseURL: `${COMMERCE_CLOUD_API}/cbus`
  }),
  endpoints: (builder) => ({
    getFarmers: getFarmersQuery(builder)
  }),
  tagTypes: ['Quote'] as string[]
})
injectQuotesEndpoints(ccApi)
injectOrdersEndpoints(ccApi)
injectDeliveriesEndpoints(ccApi)

export const { useGetFarmersQuery } = ccApi

export default ccApi
