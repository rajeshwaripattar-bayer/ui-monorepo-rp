import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { Delivery, Deliveries } from '@gc/types'
import { getAzureClient } from '@gc/api/client'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'
import { getParams } from '@gc/utils'
import { ccFieldsChannel } from '@gc/constants'
import _ from 'lodash'

const deliveryListFields = {
  MOBILE: 'ONEDCE_CBUS_MOBILE',
  DESKTOP: 'ONEDCE_CBUS_DESKTOP'
}

const getParamsStr = (
  paramsObj: object = {},
  isMobile: boolean = false,
  fields: { MOBILE: string; DESKTOP: string }
): string => getParams(paramsObj, { isMobile, fields })

export const getAllDeliveriesQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    Delivery[],
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
      updatePartialDeliveries?: (a: Delivery[]) => void
    } | void
  >({
    queryFn: async (payload) => {
      try {
        let deliveries: Delivery[] = []
        let currentPage = 0
        let result: { data: Deliveries }
        const azureClient = getAzureClient()
        do {
          const url = `${COMMERCE_CLOUD_API}/cbus/farmers/deliveries${getParamsStr(
            { ...payload?.params, currentPage },
            payload?.isMobile,
            deliveryListFields
          )}`
          result = await azureClient({ url, method: 'POST', data: payload?.reqBody || {} })
          deliveries = _.concat(deliveries, result.data.delivery || [])
          if (payload?.updatePartialDeliveries) {
            payload?.updatePartialDeliveries(deliveries)
          }
          currentPage++
        } while (currentPage < result?.data.pagination.totalPages)

        return { data: deliveries }
      } catch (error) {
        return { error }
      }
    },
    keepUnusedDataFor: 3600,
    serializeQueryArgs: ({ queryArgs }) => `deliveries${JSON.stringify(_.get(queryArgs, 'reqBody', {}))}`,
    providesTags: ['Deliveries']
  })
}

export const getDeliveryDetailsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    Delivery,
    {
      deliveryId: string
      isMobile?: boolean
      isFarmer?: boolean
    }
  >({
    query: (payload) => ({
      url:
        `${COMMERCE_CLOUD_API}/cbus/consignments/${payload.deliveryId}` +
        `?fields=${payload.isFarmer ? 'ONEDCE_CBUS_FARMER_MOBILE' : 'ONEDCE_CBUS_SHIPMENT_MOBILE'}`
    }),
    providesTags: (result, error, arg) => [
      { type: 'Delivery', id: arg.deliveryId, category: arg.isFarmer ? 'Farmer' : 'Shipment' }
    ]
  })
}
