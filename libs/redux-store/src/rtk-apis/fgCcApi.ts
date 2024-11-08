// eslint-disable-next-line @nx/enforce-module-boundaries
import { axiosBaseQuery } from '@gc/api/client'
import { FG_COMMERCE_CLOUD_API } from '@gc/shared/env'
import { createApi } from '@reduxjs/toolkit/query/react'

export const fgCcApi = createApi({
  reducerPath: 'fgCcApi',
  baseQuery: axiosBaseQuery({
    baseURL: `${FG_COMMERCE_CLOUD_API}/cbus`
  }),
  tagTypes: ['Shipment'] as string[],
  endpoints: () => ({})
})
