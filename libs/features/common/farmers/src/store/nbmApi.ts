import { fetchBaseQuery } from '@gc/api/client'
import {
  getDealerAssociatedGrowerFvAccounts,
  getNbmGrowers,
  linkedFvAccounts,
  linkGrowerFvAccount,
  unlinkGrowerFvAccount
} from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const nbmApi = createApi({
  reducerPath: 'nbmApi',
  baseQuery: fetchBaseQuery({
    baseUrlKey: 'gcPortalConfig.services.nbmUrl'
  }),
  endpoints: (builder) => ({
    getDealerAssociatedGrowerFvAccounts: getDealerAssociatedGrowerFvAccounts(builder),
    getNbmGrowers: getNbmGrowers(builder),
    linkGrowerFvAccount: linkGrowerFvAccount(builder),
    unlinkGrowerFvAccount: unlinkGrowerFvAccount(builder),
    linkedFvAccounts: linkedFvAccounts(builder)
  })
})

export const {
  useGetNbmGrowersQuery,
  useLazyGetDealerAssociatedGrowerFvAccountsQuery,
  useLazyLinkGrowerFvAccountQuery,
  useLazyUnlinkGrowerFvAccountQuery,
  useLazyLinkedFvAccountsQuery
} = nbmApi

export default nbmApi
