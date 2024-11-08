import { fetchBaseQuery } from '@gc/api/client'
import {
  getDealerAccountHierarchy,
  getFarmerDetailsByScor,
  getFarmerIdsByYear,
  getFiscalYear,
  getSingleFarmerDetails,
  searchAccounts
} from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const acsCommonApi = createApi({
  reducerPath: 'acsCommonApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'gcPortalConfig.services.acsCommonUrl'
  }),
  endpoints: (builder) => ({
    getDealerAccountHierarchy: getDealerAccountHierarchy(builder),
    getFarmerDetailsByScor: getFarmerDetailsByScor(builder),
    getFiscalYear: getFiscalYear(builder),
    getSingleFarmerDetails: getSingleFarmerDetails(builder),
    searchAccounts: searchAccounts(builder),
    getFarmerIdsByYear: getFarmerIdsByYear(builder)
  })
})

export const {
  useGetDealerAccountHierarchyQuery,
  useGetFarmerDetailsByScorQuery,
  useGetFiscalYearQuery,
  useGetSingleFarmerDetailsQuery,
  useLazyGetSingleFarmerDetailsQuery,
  useLazySearchAccountsQuery,
  useGetFarmerIdsByYearQuery
} = acsCommonApi

export default acsCommonApi
