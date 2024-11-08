import { DiscDiscount, PriceValueAndCurrency } from '@gc/types'
import { Strategy } from './discounts'

export interface ProductWithPrice {
  canView?: boolean
  canOrder?: boolean
  cropCode: string
  cropName: string
  name: string
  code: string
  quantity: number
  netQuantity: number
  totalDiscount: number
  discounts?: { programName: string; strategy: Strategy }[]
  discountedUnitPrice: number
  unitPrice: number
  subTotal: number
  warehouse: { value: string; text: string }
  statusCounts?: {
    status: string
    count: number
    isBold?: boolean
  }[]
}

export interface PriceAndDiscountSummary {
  grossPrice: number
  discount: number
  discountPercentage: number
  discounts: {
    name: string
    value: number
  }[]
  netPrice: number
  discretionaryDiscounts: DiscDiscount[]
  totalDiscretionaryDiscount: PriceValueAndCurrency
  grossPriceDiscretionaryDiscount: PriceValueAndCurrency
  netPriceDiscretionaryDiscount: PriceValueAndCurrency
}

export interface ProductsByCrop {
  crop: string
  products: ProductWithPrice[]
  avgPrice: number
  summary: PriceAndDiscountSummary
}

export interface QuantityUpdateRequest {
  quantity: string | number
  productWithPrice: ProductWithPrice
  onlyCache?: boolean
  contingencyType?: 'alert' | 'dialog'
}

export interface ReturnedProducts {
  cropCode: string
  cropName: string
  name: string
  code: string
  quantity: number
  warehouseName?: string
  UOM: string
  masterOrderNumber?: string
}
export interface ReturnedProductsByCrop {
  crop: string
  products: ReturnedProducts[]
}

export type StockOrderProduct = {
  name: string
  warehouse: { value: string; text: string }
  quantity: number
  confirmedQuantity: number
  unconfirmedQuantity: number
}

export type StockOrderProductsByCrop = {
  crop: string
  count: number
  products: StockOrderProduct[]
}
