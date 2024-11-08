/* eslint-disable @nx/enforce-module-boundaries */
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { ShipmentDelivery, ShipmentDeliveries } from '@gc/types'
import { getAzureClient } from '@gc/api/client'
import { FG_COMMERCE_CLOUD_API } from '@gc/shared/env'
import { getParams, range } from '@gc/utils'
import _ from 'lodash'

const fields = {
  MOBILE: 'ONEDCE_CBUS_FARMER_LIST_MOBILE',
  DESKTOP: 'ONEDCE_CBUS_FARMER_LIST_DESKTOP'
}

const getParamsStr = (
  paramsObj: object = {},
  isMobile = false,
  fields: { MOBILE: string; DESKTOP: string }
): string => getParams(paramsObj, { isMobile, fields })

export const getAllShipmentDeliveriesQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'fgCcApi'>) => {
  return builder.query<
  ShipmentDelivery[],
    {
      reqBody?: {
        salesYear?: string[]
        farmerSapId?: string[]
        status?: string[]
        documentTypes?: string[]
        agentSapId: string[]
      }
      params?: { currentPage?: number; fields?: string; pageSize?: number; lang?: string }
      isMobile?: boolean
      updatePartialDeliveries?: (a: ShipmentDelivery[]) => void
    } | void
  >({
    queryFn: async (payload) => {
        const azureClient = getAzureClient()
        function fetchShipments(currentPage = 0){
            const url = `${FG_COMMERCE_CLOUD_API}/cbus/agent-shipment/${payload?.isMobile ? 'mobile/':''}deliveries${getParamsStr(
                { ...payload?.params, currentPage },
                payload?.isMobile,
                fields
              )}`
              return azureClient.post<ShipmentDeliveries>( url, payload?.reqBody || {})
        }
      try {
        const { data } = await fetchShipments()
        if (payload?.updatePartialDeliveries) {
            payload?.updatePartialDeliveries(data.delivery)
        }
        let deliveries = _.concat([], data.delivery ?? [])
        const currentPage = 0
        const { totalPages } = data.pagination
        if (totalPages - 1 > currentPage) {
            const pageRange = range(currentPage + 1, totalPages)

          // Generate an array of promises based on the remaining pages and run the api calls
          // in parallel
          const totalResults = await Promise.allSettled(_.map(pageRange, (page) => fetchShipments(page)))

          // Loop over results, combining products and filtering undefined values
          _.forEach(totalResults, (results) => {
            if (results.status === 'fulfilled') {
                deliveries = _.concat(deliveries, results.value.data.delivery)
            } else {
              throw new Error(results.reason)
            }
          })
        }
        return { data: deliveries }
      } catch (error) {
        return { error }
      }
    },
    keepUnusedDataFor: 3600,
    serializeQueryArgs: ({ queryArgs }) => `shipmentDeliveries${JSON.stringify(_.get(queryArgs, 'reqBody', {}))}`,
    providesTags: ['ShipmentDeliveries']
  })
}
