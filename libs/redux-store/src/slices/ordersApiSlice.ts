import { getAllOrdersQuery, getOrderDetailsQuery } from '@gc/rtk-queries'
import { CCApiSlice, ExtendedCCApiSlice } from '@gc/types'

type ExtendedApiSlice = ExtendedCCApiSlice<{
  getAllOrders: ReturnType<typeof getAllOrdersQuery>
  getOrderDetails: ReturnType<typeof getOrderDetailsQuery>
}>

let extendedApiSlice: ExtendedApiSlice
export const injectOrdersEndpoints = (apiSlice: CCApiSlice) => {
  extendedApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllOrders: getAllOrdersQuery(builder),
      getOrderDetails: getOrderDetailsQuery(builder)
    })
  })
}

// Do not remove these line, will come handy in future when we have order edit mutations to build.
// type Endpoints = ExtendedApiSlice['endpoints']
// type Q<T extends keyof Endpoints> = InferQueryArg<Endpoints, T>
// type R<T extends keyof Endpoints> = InferResultType<Endpoints, T>

export const useOrdersQueries = () => {
  if (extendedApiSlice) {
    return extendedApiSlice
  } else {
    throw new Error('Make sure injectOrdersEndpoints was called in store.')
  }
}
