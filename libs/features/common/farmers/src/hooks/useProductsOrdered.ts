import { useSelectedAccount } from '@gc/hooks'
import { GrowerOrderSummary, Order, OrderDetails } from '@gc/types'
import omit from 'lodash/omit'

export type OrderTableRecord = OrderDetails & {
  subRows?: {
    hybrid: string
  }[]
}

export const useProductsOrdered = (orders: Order[] | GrowerOrderSummary | undefined) => {
  const { lob } = useSelectedAccount()
  let growerOrders

  if (!orders) return []

  if (lob.toLowerCase() === 'lic') {
    growerOrders = orders as GrowerOrderSummary
    return (growerOrders.growerSummaryDetails.map((e) => {
      return {
        cropName: e.cropDescription,
        currentYearNetGPOS: e.currentYearReportedGpos,
        priorYearGrowerOrder: e.priorYearReportedGpos,
        priorYearGrowerOrderMinus1: e.priorYearMinus1ReportedGpos,
        hybrid: e.product
      }
    }) || []) as OrderTableRecord[]
  }

  growerOrders = orders as Order[]
  return growerOrders.map((order) => {
    const formattedOrder = omit(order, ['productDetails']) as OrderTableRecord
    formattedOrder.subRows = order.productDetails.map((e) => ({ ...e, hybrid: e.sku }))
    return formattedOrder
  })
}

export default useProductsOrdered
