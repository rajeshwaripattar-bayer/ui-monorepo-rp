import { gigyaBaseQuery } from '@gc/api/client'
import { getCreditLimitQuery } from '@gc/rtk-queries'
import { FINANCE_API } from '@gc/shared/env'
import { createApi } from '@reduxjs/toolkit/query/react'

const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery: gigyaBaseQuery({
    baseUrlKey: FINANCE_API
    //headers: { sap-instance: 'pbc-customer-number', customer-number: '0009146406' }
  }),
  endpoints: (builder) => ({
    getCreditLimit: getCreditLimitQuery(builder)
  })
})

export const { useGetCreditLimitQuery } = financeApi

export default financeApi
