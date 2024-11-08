import { EntryBrandDiscount } from './cart'
import { CropLevelDetail } from './quoteDetails'
import { BillToParty, PriceValueAndCurrency, Warehouse } from './shared'

export type OrderDetailsCBUS = {
  name: string
  billToParties: BillToParty[]
  calculated: boolean
  code: string
  deliveryItemsQuantity: number
  distributionChannel: string
  division: string
  entries: OrderEntryCBUS[] // TODO create a shared type between Cart/Quote/Order
  growerInfo: GrowerInfo
  net: boolean
  orderErrorMessage: string
  orderType: OrderType
  roundUp: boolean
  salesYear: string
  sameDeliveryDate: boolean
  site: string
  store: string
  subTotal: PriceValueAndCurrency
  totalDiscounts: PriceValueAndCurrency
  totalItems: number
  totalPrice: PriceValueAndCurrency
  totalPriceWithTax: PriceValueAndCurrency
  totalTax: PriceValueAndCurrency
  unit: Unit
  user: User
  warehouse: Warehouse
  brandDiscounts: BrandDiscount[] // TODO create a shared type between Cart/Quote/Order
  created: string
  cropLevelDetails: CropLevelDetail[] // TODO create a shared type between Cart/Quote/Order
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

type BrandDiscount = {
  programId: string
  programName: string
  programTier?: ProgramTier
  totalDiscount?: PriceValueAndCurrency
  type: string
}

type ProgramTier = {
  bayerTierId: string
  paymentTypeCode: string
  deadline?: string
  discount?: number
  fromDate?: string
  paymentTypeValue?: string
  sortOrder?: number
  type?: string
}

export type OrderEntryCBUS = {
  cropCode: string
  cropName?: string
  entryNumber: number
  product: Product
  quantity: number
  netQuantity: number
  totalPrice?: PriceValueAndCurrency
  discountValues?: DiscountValue[]
  lineItemSubTotal: PriceValueAndCurrency
  netPrice?: PriceValueAndCurrency
  netPricePerUnit: PriceValueAndCurrency
  numberOfDiscountsApplied?: number
  totalDiscountPercentage?: number
  totalDiscountPrice: PriceValueAndCurrency
  totalPricePerUnit: PriceValueAndCurrency
  warehouse: Warehouse
  storageLocation: StorageLocation
  discretionaryDiscounts?: DiscretionaryDiscount[]
  brandDiscounts: EntryBrandDiscount[]
  rejected: boolean
  confirmedQuantity: number
  unconfirmedQuantity: number
  returnQuantity: number
  deliveredQuantity: number
  remainingToDeliverQuantity: number
  masterOrderNumber: string
}

type DiscountValue = {
  code: string
  isoCode: string
  value: number
}

type DiscretionaryDiscount = {
  itemNumber: string
  brand: string
  cropName: string
  discDescription: string
  offerReason: string
  discount: number
  recDiscount: number
  discountType: string
  status: string
  isActive: boolean
  creationTime: string
  discountProgram: BrandDiscount
  discountPerUnit: PriceValueAndCurrency
  totalDiscount: PriceValueAndCurrency
  totalPercentageDiscount: number
}

type Product = {
  canOrder: boolean
  canView: boolean
  acronymID: string
  available: number
  brandName: string
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
}

type StorageLocation = {
  locationCode: string
  locationName: string
  plant: string
}

type GrowerInfo = {
  name: string
  uid: string
  sapAccountId: string
}

type OrderType = {
  code: string
  visible: boolean
}

type PaymentType = {
  code: string
}

type Unit = {
  sapAccountId: string
}

type User = {
  name: string
  uid: string
}
