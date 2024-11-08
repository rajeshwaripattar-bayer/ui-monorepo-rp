/* eslint-disable @nx/enforce-module-boundaries */
import { getAllShipmentDeliveriesQuery } from '@gc/rtk-queries'
import { FgCcApiSlice, ExtendedFgCcApiSlice } from '@gc/types'

type ExtendedApiSlice = ExtendedFgCcApiSlice<{
  getAllShipmentDeliveries: ReturnType<typeof getAllShipmentDeliveriesQuery>
}>

let extendedApiSlice: ExtendedApiSlice
export const injectShipmentEndpoints = (apiSlice: FgCcApiSlice) => {
  extendedApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllShipmentDeliveries: getAllShipmentDeliveriesQuery(builder),
    })
  })
}

// Do not remove these line, will come handy in future when we have delivery edit mutations to build.
// type Endpoints = ExtendedApiSlice['endpoints']
// type Q<T extends keyof Endpoints> = InferQueryArg<Endpoints, T>
// type R<T extends keyof Endpoints> = InferResultType<Endpoints, T>

export const useGetAllShipmentDeliveriesQueries = () => {
  if (extendedApiSlice) {
    return extendedApiSlice
  } else {
    throw new Error('Make sure injectShipmentEndpoints was called in store.')
  }
}
