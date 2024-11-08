import { OrderProduct, OrderType } from './orders'
import { GrowerInfo, PaymentType, PriceValueAndCurrency, Unit, UserNameId, Warehouse } from './shared'

export type StockOrder = {
  barterContractNumber: string
  billToParty: string
  calculated: boolean
  code: string
  deliveryItemsQuantity: number
  deliveryMode: DeliveryMode
  distributionChannel: string
  division: string
  entries: StockOrderEntry[]
  growerInfo: GrowerInfo
  legalNumber: string
  net: boolean
  orderType: OrderType
  paymentTerm: string
  paymentTermDescription: string
  regionName: string
  regionSAPId: string
  requestedDeliveryDate: Date
  roundUp: boolean
  sameDeliveryDate: boolean
  shipToParty: string
  site: string
  store: string
  subTotal: PriceValueAndCurrency
  totalDiscounts: PriceValueAndCurrency
  totalItems: number
  totalPrice: PriceValueAndCurrency
  totalPriceWithTax: PriceValueAndCurrency
  totalTax: PriceValueAndCurrency
  unit: Unit
  user: UserNameId
  created: Date
  cropLevelDetails: CropLevelDetail[]
  customerTaxId: string
  deliveryStatus: string
  documentType: string
  lob: string
  orderNumber: string
  paymentType: PaymentType
  purchaseOrderNumber: string
  seasonCode: string
  status: string
  statusText: string
  totalBrandDiscount: PriceValueAndCurrency
  totalDiscountsPrice: PriceValueAndCurrency
}

type CropLevelDetail = {
  crop: string
  details: Details
}

type Details = {
  averagePricePerUnit: PriceValueAndCurrency
  discounts: PriceValueAndCurrency
  grossPrice: PriceValueAndCurrency
  netPrice: PriceValueAndCurrency
  productsCount: number
}

type DeliveryMode = {
  code: string
  deliveryCost: PriceValueAndCurrency
}

export type StockOrderEntry = {
  batchNumber: string
  cropCode: string
  cropName: string
  deliveredQuantity: number
  discountValues: DiscountValue[]
  entryNumber: number
  lineItemSubTotal: PriceValueAndCurrency
  netPricePerUnit: PriceValueAndCurrency
  netQuantity: number
  numberOfDiscountsApplied: number
  product: OrderProduct
  quantity: number
  rejected: boolean
  remainingToDeliverQuantity: number
  returnQuantity: number
  totalDiscountPrice: PriceValueAndCurrency
  totalPricePerUnit: PriceValueAndCurrency
  confirmedQuantity: number
  unconfirmedQuantity: number
  warehouse: Warehouse
}

type DiscountValue = {
  code: string
  isoCode: string
  value: number
}
