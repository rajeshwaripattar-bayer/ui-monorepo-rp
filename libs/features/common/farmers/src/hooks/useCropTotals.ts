import { useSelectedAccount } from '@gc/hooks'
import { CropTotals, GrowerOrderSummary, Order, OrderDetails } from '@gc/types'

export const useCropTotals = (orders: Order[] | GrowerOrderSummary | undefined) => {
  const { lob } = useSelectedAccount()
  let growerOrders

  if (!orders) return []

  if (lob.toLowerCase() === 'lic') {
    growerOrders = orders as GrowerOrderSummary
    return (growerOrders?.cropTotals?.map((e: CropTotals) => {
      return {
        cropName: e.crop,
        currentYearNetGPOS: e.currentYearReportedGpos,
        priorYearGrowerOrder: e.priorYearReportedGpos,
        priorYearGrowerOrderMinus1: e.priorYearMinus1ReportedGpos
      }
    }) || []) as OrderDetails[]
  }

  growerOrders = orders as Order[]
  const uniqueAggregation: { [key: string]: OrderDetails } = {}

  growerOrders?.forEach((order) => {
    const { cropName, currentYearGrowerOrder, currentYearNetGPOS, priorYearGrowerOrder, priorYearGrowerOrderMinus1 } =
      order

    if (!uniqueAggregation[cropName]) {
      uniqueAggregation[cropName] = {
        cropName,
        currentYearGrowerOrder: 0,
        currentYearNetGPOS: 0,
        priorYearGrowerOrder: 0,
        priorYearGrowerOrderMinus1: 0
      }
    }

    uniqueAggregation[cropName].currentYearGrowerOrder! += currentYearGrowerOrder ?? 0
    uniqueAggregation[cropName].currentYearNetGPOS += currentYearNetGPOS
    uniqueAggregation[cropName].priorYearGrowerOrder += priorYearGrowerOrder
    uniqueAggregation[cropName].priorYearGrowerOrderMinus1 += priorYearGrowerOrderMinus1
  })

  return Object.values(uniqueAggregation)
}

export default useCropTotals
