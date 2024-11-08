import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@gc/api/client'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'

export const ccApi = createApi({
  reducerPath: 'ccApi',
  baseQuery: axiosBaseQuery({
    baseURL: `${COMMERCE_CLOUD_API}/cbus`
  }),
  tagTypes: ['Quote', 'Cart', 'Products', 'Favorites', 'RecommendedRange'] as string[],
  endpoints: () => ({})
})
