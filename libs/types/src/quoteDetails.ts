import { BrandDiscountEntry, DiscretionaryDiscount, EntryBrandDiscount } from './cart'
import { StorageLocation } from './configData'
import { BillToParty, PriceValueAndCurrency, Warehouse } from './shared'
import { Product } from './products'

export type QuoteDetails = {
  allowedActions: string[]
  billToParties: BillToParty[]
  brandDiscounts: BrandDiscountEntry[]
  code: string
  creationTime: string
  cropLevelDetails: CropLevelDetail[]
  entries: Entry[]
  expirationTime: string
  farmer: Farmer
  name: string
  netPrice: Price
  nonRejectedLineItemsCount: number
  paymentTerm: string
  primaryPayer: string
  salesYear: string
  status: string
  statusText: string
  totalDiscountPercentage: number
  totalDiscountsPrice: Price
  totalPrice: Price
  updatedTime: string
  user: User
}

export interface DiscDiscount {
  programId: string
  programName: string
  type: string
  totalDiscount: PriceValueAndCurrency
}

export type CropLevelDetail = {
  crop: string
  details: Details
  cropDisplayText: string
  discounts?: DiscDiscount[]
}

type Details = {
  averagePricePerUnit: PriceValueAndCurrency
  currency: string
  discountPrice: PriceValueAndCurrency
  discounts?: PriceValueAndCurrency
  grossPrice: PriceValueAndCurrency
  netPrice: PriceValueAndCurrency
  percentageDiscount: number
  productsCount: number
}

type Entry = {
  discretionaryDiscounts?: DiscretionaryDiscount[]
  brandDiscounts?: EntryBrandDiscount[]
  bayerDiscounts?: DiscretionaryDiscount[]
  cropCode: string
  cropName: string
  discountValues: DiscountValue[]
  entryNumber: number
  lineItemSubTotal: PriceValueAndCurrency
  netPrice: PriceValueAndCurrency
  netPricePerUnit: PriceValueAndCurrency
  numberOfDiscountsApplied: number
  product: Product
  quantity: number
  totalDiscountPercentage: number
  totalDiscountPrice: PriceValueAndCurrency
  totalPrice: PriceValueAndCurrency
  totalPricePerUnit: PriceValueAndCurrency
  warehouse: Warehouse
  storageLocation: StorageLocation
  rejected?: boolean
}

export type DiscountValue = {
  code: string
  isoCode: string
  value: number
}

type Farmer = {
  name: string
  sapAccountId: string
}

type Price = {
  currencyIso: string
  currencySymbol: string
  value: number
}

export type cropLevelDetails = {
  crop: string
  cropDisplayText: string
  details: cropDetails
}

type cropDetails = {
  averagePricePerUnit: PriceValueAndCurrency
  currency: string
  discountPrice: PriceValueAndCurrency
  grossPrice: PriceValueAndCurrency
  netPrice: PriceValueAndCurrency
  percentageDiscount: number
  productsCount: number
}
type User = {
  name: string
  uid: string
}
