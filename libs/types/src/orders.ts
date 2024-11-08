import { PaymentType, PriceValueAndCurrency, Warehouse, GrowerInfo, UserNameId, Unit } from './shared'

export type OrderDetails = {
  cropName: string
  hybrid?: string
  currentYearGrowerOrder?: number
  currentYearNetGPOS: number
  priorYearGrowerOrder: number
  priorYearGrowerOrderMinus1: number
}

export type Order = OrderDetails & {
  productDetails: OrderDetails &
    {
      sku: string
    }[]
}

export type GrowerSummaryDetails = {
  cropDescription: string
  product: string
  currentYearReportedGpos: number
  priorYearReportedGpos: number
  priorYearMinus1ReportedGpos: number
}

export type CropTotals = {
  crop: string
  currentYearReportedGpos: number
  priorYearMinus1ReportedGpos: number
  priorYearReportedGpos: number
}

export type GrowerOrderSummary = {
  growerSummaryDetails: GrowerSummaryDetails[]
  cropTotals: CropTotals[]
}

export type Pagination = {
  currentPage: number
  pageSize: number
  sort: string
  totalPages: number
  totalResults: number
}

export type ChannelOrder = {
  billToParties: BillToParty[]
  calculated: boolean
  code: string
  name: string
  deliveryItemsQuantity: number
  distributionChannel: string
  division: string
  entries: ChannelOrderEntry[]
  growerInfo: GrowerInfo
  net: boolean
  orderErrorMessage: string
  orderType: OrderType
  roundUp: boolean
  salesYear: string
  sameDeliveryDate: boolean
  site: string
  store: string
  subTotal: SubTotal
  totalDiscounts: TotalDiscounts
  totalDiscountsPrice: TotalDiscounts
  totalItems: number
  totalPrice: TotalPrice
  totalPriceWithTax: TotalPriceWithTax
  totalTax: TotalTax
  unit: Unit
  user: UserNameId
  warehouse: Warehouse2
  brandDiscounts: BrandDiscount2[]
  created: string
  cropLevelDetails: CropLevelDetail[]
  documentType: string
  hybrisOrderNumber: string
  lob: string
  orderNumber: string
  paymentType: PaymentType
  purchaseOrderNumber: string
  status: string
  statusText: string
  totalBrandDiscount: PriceValueAndCurrency
}

type BillToParty = {
  isPrimaryBillTo: boolean
  name: string
  paymentTerm: string
  paymentTermDescription: string
  percentage: number
  sapAccountId: string
}

export type ChannelOrderEntry = {
  brandDiscounts: BrandDiscount[]
  cropCode: string
  cropName: string
  deliveredQuantity: number
  entryNumber: number
  lineItemSubTotal: LineItemSubTotal
  netPricePerUnit: NetPricePerUnit
  netQuantity: number
  product: OrderProduct
  quantity: number
  rejected: boolean
  remainingToDeliverQuantity: number
  returnQuantity: number
  storageLocation: StorageLocation
  totalDiscountPrice: TotalDiscountPrice
  totalPricePerUnit: TotalPricePerUnit
  warehouse: Warehouse
}

type BrandDiscount = {
  itemNumber: string
  discount: number
  discountType: string
  status: string
  isActive: boolean
  creationTime: string
  discountProgram: DiscountProgram
  discountPerUnit: DiscountPerUnit
  totalDiscount: TotalDiscount
  totalPercentageDiscount: number
}

type DiscountProgram = {
  programId: string
  programName: string
  programTier: ProgramTier
  type: string
}

type ProgramTier = {
  bayerTierId: string
  deadline: string
  discount: number
  fromDate: string
  paymentTypeCode: string
  paymentTypeValue: string
  sortOrder: number
  type: string
}

type DiscountPerUnit = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalDiscount = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type LineItemSubTotal = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type NetPricePerUnit = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

export type OrderProduct = {
  acronymID: string
  available: number
  brandName: string
  canOrder: boolean
  canView: boolean
  code: string
  name: string
  packageDescription: string
  packageSizeCode: string
  packageType: string
  salesUnitOfMeasure: string
  shortPackageType: string
  specialTreatmentCode: string
  specialTreatmentDescription: string
  species: string
  unitOfMeasures: UnitOfMeasure[]
}

type UnitOfMeasure = {
  conversion: number
  name: string
}

type StorageLocation = {
  code: string
  locationCode: string
  locationName: string
  plant: string
}

type TotalDiscountPrice = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalPricePerUnit = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

export type OrderType = {
  code: string
  visible: boolean
}

type SubTotal = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalDiscounts = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalPrice = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalPriceWithTax = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type TotalTax = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type Warehouse2 = {
  code: string
  name: string
  plantCode: string
}

// TODO: Remove this
type BrandDiscount2 = {
  programId: string
  programName: string
  programTier: ProgramTier2
  totalDiscount: TotalDiscount2
  type: string
}

type ProgramTier2 = {
  bayerTierId: string
  paymentTypeCode: string
}

type TotalDiscount2 = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type CropLevelDetail = {
  crop: string
  details: Details
  discounts: Discount[]
}

type Details = {
  averagePricePerUnit: AveragePricePerUnit
  discounts: Discounts
  grossPrice: GrossPrice
  netPrice: NetPrice
  percentageDiscount: number
  productsCount: number
}

type AveragePricePerUnit = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type Discounts = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type GrossPrice = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type NetPrice = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

type Discount = {
  programId: string
  programName: string
  totalDiscount: TotalDiscount3
  type: string
}

type TotalDiscount3 = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

export type Orders = {
  pagination: Pagination
  orders: ChannelOrder[]
}
