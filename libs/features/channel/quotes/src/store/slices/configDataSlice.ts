import { ccApi } from '@gc/redux-store'
import { getPaymentTermsQuery, getStorageLocationsQuery, getFarmersQuery } from '@gc/rtk-queries'

export const extendedApiSlice = ccApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStorageLocations: getStorageLocationsQuery(builder),
    getPaymentTerms: getPaymentTermsQuery(builder),
    getFarmers: getFarmersQuery(builder)
  })
})

export const { useGetStorageLocationsQuery, useGetPaymentTermsQuery, useGetFarmersQuery } = extendedApiSlice
