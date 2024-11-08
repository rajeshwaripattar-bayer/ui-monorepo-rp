import { getAllDeliveriesQuery, getDeliveryDetailsQuery } from '@gc/rtk-queries'
import { CCApiSlice, ExtendedCCApiSlice } from '@gc/types'

type ExtendedApiSlice = ExtendedCCApiSlice<{
  getAllDeliveries: ReturnType<typeof getAllDeliveriesQuery>
  getDeliveryDetails: ReturnType<typeof getDeliveryDetailsQuery>
}>

let extendedApiSlice: ExtendedApiSlice
export const injectDeliveriesEndpoints = (apiSlice: CCApiSlice) => {
  extendedApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllDeliveries: getAllDeliveriesQuery(builder),
      getDeliveryDetails: getDeliveryDetailsQuery(builder)
    })
  })
}

// Do not remove these line, will come handy in future when we have delivery edit mutations to build.
// type Endpoints = ExtendedApiSlice['endpoints']
// type Q<T extends keyof Endpoints> = InferQueryArg<Endpoints, T>
// type R<T extends keyof Endpoints> = InferResultType<Endpoints, T>

export const useDeliveriesQueries = () => {
  if (extendedApiSlice) {
    return extendedApiSlice
  } else {
    throw new Error('Make sure injectDeliveriesEndpoints was called in store.')
  }
}
