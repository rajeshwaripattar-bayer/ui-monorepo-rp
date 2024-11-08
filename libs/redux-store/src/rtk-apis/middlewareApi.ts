import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@gc/api/client'
import { GC_MIDDLEWARE_API } from '@gc/shared/env'

export const middlewareApi = createApi({
  reducerPath: 'middlewareApi',
  baseQuery: axiosBaseQuery({
    baseURL: `${GC_MIDDLEWARE_API}`
  }),
  tagTypes: ['RecommendedRange'] as string[],
  endpoints: () => ({})
})
