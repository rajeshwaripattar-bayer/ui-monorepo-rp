import { getPaymentTermsQuery, getStorageLocationsQuery, getFarmersQuery } from '@gc/rtk-queries'
import { CCApiSlice, ExtendedCCApiSlice } from '@gc/types'

type ExtendedApiSlice = ExtendedCCApiSlice<{
  getStorageLocations: ReturnType<typeof getStorageLocationsQuery>
  getPaymentTerms: ReturnType<typeof getPaymentTermsQuery>
  getFarmers: ReturnType<typeof getFarmersQuery>
}>

let extendedApiSlice: ExtendedApiSlice
export const injectConfigDataEndpoints = (apiSlice: CCApiSlice) => {
  extendedApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getStorageLocations: getStorageLocationsQuery(builder),
      getPaymentTerms: getPaymentTermsQuery(builder),
      getFarmers: getFarmersQuery(builder)
    })
  })
}
export const useConfigDataQueries = () => {
  return extendedApiSlice
}
