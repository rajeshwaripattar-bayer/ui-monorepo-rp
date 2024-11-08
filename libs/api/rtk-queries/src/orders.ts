import { getAzureClient } from '@gc/api/client'
import { ccFieldsChannel } from '@gc/constants'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'
import { ChannelOrder, Order, OrderDetailsCBUS, Orders, StockOrder } from '@gc/types'
import { fetchStore, getParams, getUserPrefix } from '@gc/utils'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import _ from 'lodash'
type OrderResponse = { orderList: Order[] }

const urlPrefix = () => `${getUserPrefix()}/orders`
const getParamsStr = (
  paramsObj: object = {},
  isMobile: boolean | undefined = false,
  fields: { MOBILE: string; DESKTOP: string } = { MOBILE: '', DESKTOP: '' }
): string => getParams(paramsObj, { isMobile, fields })

export function getFarmerOrderDetailsNational(builder: EndpointBuilder<BaseQueryFn, string, 'seedServiceApi'>) {
  return builder.query<Order[], { dealerSapId: string; growerSapId: string; fiscalYear: string }>({
    query: ({ dealerSapId, growerSapId, fiscalYear }) => {
      const body = { sapAccountId: dealerSapId, growerSAPId: growerSapId, fiscalYear, priorYears: 2 }
      return {
        url: '/farmers/farmerOrderDetails',
        method: 'POST',
        responseHandler: 'content-type',
        body
      }
    },
    transformResponse: (response: OrderResponse) => {
      return response.orderList || []
    }
  })
}

export function getFarmerOrderDetailsChannel(builder: EndpointBuilder<BaseQueryFn, string, 'acsMyAccountApi'>) {
  return builder.query<Order[], { growerSapId: string }>({
    query({ growerSapId }) {
      const { sapAccountId } = fetchStore('selectedAccount')
      return {
        url: '/farmers/growerOrderDetails',
        params: {
          sapAccountId,
          growerSapAccountId: growerSapId
        }
      }
    },
    transformResponse: (response: OrderResponse) => {
      return response.orderList || []
    }
  })
}

export const getAllOrdersQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    ChannelOrder[] | StockOrder[],
    {
      reqBody?: {
        pageSize?: number
        soldToAccounts?: string[]
        documentTypes?: string[]
        agents?: string[]
        salesYears?: string[]
      }
      params?: { currentPage?: number; fields?: string; pageSize?: number; lang?: string }
      isMobile?: boolean
      updatePartialOrders?: (a: ChannelOrder[]) => void
    } | void
  >({
    queryFn: async (payload) => {
      try {
        let orders: ChannelOrder[] = []
        let currentPage = 0
        let result: { data: Orders }
        const azureClient = getAzureClient()
        do {
          const url = `${COMMERCE_CLOUD_API}/cbus${getUserPrefix()}/allorders${getParamsStr(
            { ...payload?.params, currentPage },
            payload?.isMobile,
            { MOBILE: 'ONEDCE_CBUS', DESKTOP: 'ONEDCE_CBUS' }
          )}`
          result = await azureClient({ url, method: 'POST', data: payload?.reqBody || {} })
          orders = _.concat(orders, result.data.orders || [])
          if (payload?.updatePartialOrders) {
            payload?.updatePartialOrders(orders)
          }
          currentPage++
        } while (currentPage < result?.data.pagination.totalPages)

        return { data: orders }
      } catch (error) {
        return { error }
      }
    },
    keepUnusedDataFor: 3600,
    serializeQueryArgs: ({ queryArgs }) => `orders${JSON.stringify(_.get(queryArgs, 'reqBody', {}))}`,
    providesTags: ['order']
  })
}

export const getOrderDetailsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    OrderDetailsCBUS,
    {
      orderId: string
      isMobile?: boolean
    }
  >({
    query: (payload) => ({
      url: `${urlPrefix()}/${payload.orderId}` + getParamsStr({}, payload?.isMobile, ccFieldsChannel)
    }),
    providesTags: (result, error, arg) => [{ type: 'Order', id: arg.orderId }]
  })
}
