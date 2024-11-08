import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { PaymentTerm, StorageLocation, Farmer } from '@gc/types'
import { GC_MIDDLEWARE_API } from '@gc/shared/env'

export const getStorageLocationsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<StorageLocation[], string>({
    query: (warehouse) => ({
      url: `/storage-locations?fields=ONEDCE_CBUS&warehouse=${warehouse}&locationType=Saleable`
    }),
    transformResponse: (response: { storageLocations: StorageLocation[] }) =>
      response?.storageLocations as StorageLocation[]
  })
}

export const getPaymentTermsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<PaymentTerm[], void>({
    query: () => ({
      url: '/codes?entity=PaymentTerm&erpSystem=BC&fields=FULL&visible=true'
    }),
    transformResponse: (response: { codes: PaymentTerm[] }) => response?.codes as PaymentTerm[]
  })
}

export const getFarmersQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<{ farmerDetails: Farmer[]; licensedGrowerTotals: undefined }, { sapId: string }>({
    query: ({ sapId }) => ({
      url: `${GC_MIDDLEWARE_API}/hierarchy/growers/us/${sapId}`
    }),
    transformResponse: (response: Farmer[]) => {
      //TODO Added this mock data for cyOrder & licenseStatus for DEMO only - Must be gone once we have actual data
      return {
        farmerDetails: response
          .filter((grower: Farmer) => grower.sourceId)
          .map((r, i) => ({
            ...r,
            cyOrder: i % 2 === 0
          })),
        licensedGrowerTotals: undefined
      }
    }
  })
}
