import { StorageLocation } from './configData'
import { CropLevelDetail } from './quoteDetails'
import { BillToParty, PriceValueAndCurrency, Warehouse } from './shared'

export type Cart = {
  calculated: boolean
  code: string
  cropLevelDetails: CropLevelDetail[]
  deliveryItemsQuantity: number
  entries: Entry[]
  draftEntries: Entry[]
  guid: string
  net: boolean
  orderDiscounts: PriceValueAndCurrency
  pickupItemsQuantity: number
  productDiscounts: PriceValueAndCurrency
  roundUp: boolean
  site: string
  store: string
  subTotal: PriceValueAndCurrency
  totalDiscounts: PriceValueAndCurrency
  totalItems: number
  totalPrice: PriceValueAndCurrency
  totalPriceWithTax: PriceValueAndCurrency
  totalTax: PriceValueAndCurrency
  unit: Unit
  paymentType: PaymentType
  simulated: boolean
  totalUnitCount: number
  grower: string
  growerStateCode: string
  agentSapId: string
  growerCountyCode: string
  salesOffice: string
  salesGroup: string
  salesDistrict: string
  billToParties: BillToParty[]
  expirationDate: Date
  expirationTime: string // TODO need to check with Team
  name: string
  draftDiscretionaryDiscounts?: DraftDiscretionaryDiscount[]
  totalBrandDiscount?: PriceValueAndCurrency
  brandDiscounts?: BrandDiscountEntry[]
  warehouse?: Warehouse
  cartType?: string
}

export type Entry = {
  cropCode: string
  cropName?: string
  entryNumber?: number
  product: Product
  quantity?: number
  totalPrice?: PriceValueAndCurrency
  discountValues?: DiscountValue[]
  lineItemSubTotal?: PriceValueAndCurrency
  netPrice?: PriceValueAndCurrency
  netPricePerUnit?: PriceValueAndCurrency
  numberOfDiscountsApplied?: number
  totalDiscountPercentage?: number
  totalDiscountPrice?: PriceValueAndCurrency
  totalPricePerUnit?: PriceValueAndCurrency
  warehouse?: Warehouse
  storageLocation?: StorageLocation
  discretionaryDiscounts?: DiscretionaryDiscount[]
  bayerDiscounts?: DiscretionaryDiscount[]
  brandDiscounts?: EntryBrandDiscount[]
  rejected?: boolean
}

type DiscountValue = {
  code: string
  isoCode: string
  value: number
}

type Product = {
  availableForPickup?: boolean
  canOrder?: boolean
  canView?: boolean
  code: string
  configurable?: boolean
  name?: string
  purchasable?: boolean
  stock?: Stock
  url?: string
  salesUnitOfMeasure?: string
  acronymID?: string
  specialTreatmentCode?: string
}

type Stock = {
  isValueRounded: boolean
  stockLevelStatus: string
}


type PaymentType = {
  code: string
  displayName: string
}

type Unit = {
  sapAccountId: string
}

export type DraftDiscretionaryDiscount = DiscountEntry & {
  itemNumber?: string
  entryNumber: number
  isActive: boolean
}

// TODO DiscountEntryNew will need to replaced with DiscountEntry once all PUT/POST endpoints can new discountProgram object.
export type DiscountEntryNew = {
  discountProgram: DiscountProgram
  brand: string
  cropName: string
  discDescription: string
  offerReason: string
  discount: number
  recDiscount: number
  discountType: string
  status: string
  itemNumber: string
  totalDiscount: TotalDiscount
  discountPerUnit: TotalDiscount
}

export type TotalDiscount = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

export type DiscountEntry = {
  program: string
  brand: string
  cropName: string
  discDescription: string
  offerReason: string
  discount: number
  recDiscount: number
  discountType: string
  status?: string
  itemNumber?: string
}

export interface DiscountProgram {
  programId?: string
  programName: string
  type?: string
  year?: string
  programTier?: programTier
}
export interface BrandDiscountEntry extends DiscountProgram {
  programCrop?: string
  discount?: number
  discountType?: string
  programTier?: programTier
  totalDiscount?: PriceValueAndCurrency
  tier?: string
  isActive?: boolean
}

export interface EntryBrandDiscount extends BrandDiscountEntry {
  discountPerUnit: PriceValueAndCurrency
  discountProgram: DiscountProgram
  isActive: boolean
  itemNumber: string
  status: string
  totalDiscount: PriceValueAndCurrency
  totalPercentageDiscount: number
  creationTime: string
}

export interface programTier {
  bayerTierId: string
  paymentTypeCode?: string
  deadline?: string
}
export interface BayerDiscountEntries {
  entryNumber: string
  discounts: DiscountEntry[]
}

export type BayerDiscountEntriesPostPayload = {
  entryNumber: string
  discounts: DiscountEntry[]
}

export type DiscretionaryDiscount = DiscountEntryNew & {
  isActive: boolean
  creationTime: string
}

export type BayerDiscountEntriesPutPayload = {
  entryNumber: string
  discounts: (DiscountEntry | { status: string; itemNumber: string })[]
}

export type BayerEntriesResponse = {
  barterContractTypeCodeModified: boolean
  cartModifications: CartModification[]
  commodityCodeModified: boolean
  orderReasonModified: boolean
  paymentDueDateModified: boolean
  paymentMethodModified: boolean
  paymentTermModified: boolean
  proposedPaymentMethodModified: boolean
  requestedDeliveryDateModified: boolean
}

type CartModification = {
  entry: Entry
  modifiedAdditionalAttributes: string[]
  quantity: number
  quantityAdded: number
  statusCode: string
}

export type BayerEntryResponse = {
  entry: Entry
  modifiedAdditionalAttributes: string[]
  quantity: number
  quantityAdded: number
  statusCode: string
}
