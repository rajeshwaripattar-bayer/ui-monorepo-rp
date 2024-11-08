import { fetchBaseQuery } from '@gc/api/client'
import { getTextBlockFromAem } from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const aemApi = createApi({
  reducerPath: 'aemApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'hostname.aem'
  }),
  endpoints: (builder) => ({
    getTextBlockFromAem: getTextBlockFromAem(builder)
  })
})

export const { useGetTextBlockFromAemQuery } = aemApi

export default aemApi
